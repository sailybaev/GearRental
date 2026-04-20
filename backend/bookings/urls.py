from django.urls import path
from .views import BookingListCreateView, check_availability, cancel_booking

urlpatterns = [
    path('', BookingListCreateView.as_view(), name='booking-list-create'),
    path('check-availability/', check_availability, name='check-availability'),
    path('<int:pk>/cancel/', cancel_booking, name='cancel-booking'),
]
