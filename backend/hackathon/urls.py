from django.urls import path

from .views import (
    ApiLoginView,
    ApiLogoutView,
    ApiMeView,
    ApiOtpRequestView,
    ApiOtpVerifyView,
    HealthView,
)
from . import views_vocab
from . import views_game_results  # ADD THIS LINE


urlpatterns = [
    path("", HealthView.as_view(), name="health"),
    path("api/login", ApiLoginView.as_view(), name="api_login"),
    path("api/otp/request", ApiOtpRequestView.as_view(), name="api_otp_request"),
    path("api/otp/verify", ApiOtpVerifyView.as_view(), name="api_otp_verify"),
    path("api/me", ApiMeView.as_view(), name="api_me"),
    path("api/logout", ApiLogoutView.as_view(), name="api_logout"),
    path("api/vocab/next/", views_vocab.next_vocab_word, name="next-vocab-word"),
    path(
        "api/game-results/",
        views_game_results.save_game_results,
        name="save_game_results",
    ),
    path(
        "api/game-results/<int:user_id>/",
        views_game_results.get_user_game_results,
        name="get_user_game_results",
    ),
    path(
        "api/game-stats/<int:user_id>/",
        views_game_results.get_game_stats,
        name="get_game_stats",
    ),
]
