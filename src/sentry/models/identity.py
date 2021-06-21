import logging

from django.conf import settings
from django.db import models
from django.db.models import Q
from django.utils import timezone

from sentry.db.models import (
    ArrayField,
    BoundedPositiveIntegerField,
    EncryptedJsonField,
    FlexibleForeignKey,
    Model,
)

logger = logging.getLogger(__name__)


# TODO(dcramer): pull in enum library
class IdentityStatus:
    UNKNOWN = 0
    VALID = 1
    INVALID = 2


class Identity(Model):
    """
    A verified link between a user and a third party identity.
    """

    __include_in_export__ = False

    idp = FlexibleForeignKey("sentry.IdentityProvider")
    user = FlexibleForeignKey(settings.AUTH_USER_MODEL)
    external_id = models.TextField()
    data = EncryptedJsonField()
    status = BoundedPositiveIntegerField(default=IdentityStatus.UNKNOWN)
    scopes = ArrayField()
    date_verified = models.DateTimeField(default=timezone.now)
    date_added = models.DateTimeField(default=timezone.now)

    class Meta:
        app_label = "sentry"
        db_table = "sentry_identity"
        unique_together = (("idp", "external_id"), ("idp", "user"))

    def get_provider(self):
        from sentry.identity import get

        return get(self.idp.type)

    @classmethod
    def reattach(cls, idp, external_id, user, defaults):
        """
        Removes identities under `idp` associated with either `external_id` or `user`
        and creates a new identity linking them.
        """
        lookup = Q(external_id=external_id) | Q(user=user)
        Identity.objects.filter(lookup, idp=idp).delete()
        logger.info(
            "deleted-identity",
            extra={"external_id": external_id, "idp_id": idp.id, "user_id": user.id},
        )

        identity_model = Identity.objects.create(
            idp=idp, user=user, external_id=external_id, **defaults
        )
        logger.info(
            "created-identity",
            extra={
                "idp_id": idp.id,
                "external_id": external_id,
                "object_id": identity_model.id,
                "user_id": user.id,
            },
        )
        return identity_model

    @classmethod
    def update_external_id_and_defaults(cls, idp, external_id, user, defaults):
        """
        Updates the identity object for a given user and identity provider
        with the new external id and other fields related to the identity status
        """
        query = Identity.objects.filter(user=user, idp=idp)
        query.update(external_id=external_id, **defaults)
        identity_model = query.first()
        logger.info(
            "updated-identity",
            extra={
                "external_id": external_id,
                "idp_id": idp.id,
                "user_id": user.id,
                "identity_id": identity_model.id,
            },
        )
        return identity_model
