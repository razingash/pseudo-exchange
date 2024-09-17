from rest_framework import permissions
from rest_framework_simplejwt.exceptions import AuthenticationFailed, TokenError
from rest_framework_simplejwt.tokens import AccessToken

from bank.models import AccountAuthInfo


class IsValidRequest(permissions.BasePermission):
    """use only with IsAuthenticated permission"""

    def has_permission(self, request, view):
        account_uuid = view.kwargs.get('account_uuid')
        if not account_uuid:
            raise AuthenticationFailed('Account UUID is required in URL.')
        auth_header = request.headers.get('Authorization')

        if auth_header:
            try:
                token_type, access_token = auth_header.split()

                if token_type.lower() != 'token':
                    raise AuthenticationFailed('Invalid token type. Expected "Token".')

                token = AccessToken(access_token)
                token_user_id = token['user_id']
                if not AccountAuthInfo.objects.filter(id=token_user_id, uuid=account_uuid).exists():
                    raise AuthenticationFailed('Invalid token for this user')

            except TokenError as e:
                raise AuthenticationFailed(f'Token error: {str(e)}')

        return True

