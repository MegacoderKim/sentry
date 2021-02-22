# Generated by Django 1.11.29 on 2021-02-22 16:07

from django.conf import settings
from django.db import migrations
import django.db.models.deletion
import sentry.db.models.fields.foreignkey


class Migration(migrations.Migration):
    # This flag is used to mark that a migration shouldn't be automatically run in
    # production. We set this to True for operations that we think are risky and want
    # someone from ops to run manually and monitor.
    # General advice is that if in doubt, mark your migration as `is_dangerous`.
    # Some things you should always mark as dangerous:
    # - Large data migrations. Typically we want these to be run manually by ops so that
    #   they can be monitored. Since data migrations will now hold a transaction open
    #   this is even more important.
    # - Adding columns to highly active tables, even ones that are NULL.
    is_dangerous = False

    # This flag is used to decide whether to run this migration in a transaction or not.
    # By default we prefer to run in a transaction, but for migrations where you want
    # to `CREATE INDEX CONCURRENTLY` this needs to be set to False. Typically you'll
    # want to create an index concurrently when adding one to an existing table.
    # You'll also usually want to set this to `False` if you're writing a data
    # migration, since we don't want the entire migration to run in one long-running
    # transaction.
    atomic = True

    dependencies = [
        ("sentry", "0163_add_organizationmember_and_external_name"),
    ]

    operations = [
        migrations.AddField(
            model_name="alertrule",
            name="team",
            field=sentry.db.models.fields.foreignkey.FlexibleForeignKey(
                null=True, on_delete=django.db.models.deletion.CASCADE, to="sentry.Team"
            ),
        ),
        migrations.AddField(
            model_name="alertrule",
            name="user",
            field=sentry.db.models.fields.foreignkey.FlexibleForeignKey(
                null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL
            ),
        ),
    ]
