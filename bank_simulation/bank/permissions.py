import uuid

from django.core.exceptions import PermissionDenied
from rest_framework import permissions


class IsUuidProvided(permissions.BasePermission):

    def has_permission(self, request, view):
        user_uuid = request.data.get('uuid')

        if user_uuid is None:
            raise PermissionDenied({"error": "'uuid' field is required"})

        try:
            uuid.UUID(user_uuid, version=4)
        except ValueError:
            raise PermissionDenied({"error": "Invalid UUID provided"})

        return True

