window.app = app = app || {}

jQuery ->

    app.GroupList = class GroupList extends Backbone.Collection

        initialize: ->
            _.bindAll @

            model = app.Group

        comparator: (member) ->
            -member.get('score')
