from datetime import date
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Booking
from .serializers import BookingSerializer, AvailabilitySerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_availability(request):
    serializer = AvailabilitySerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    overlapping = Booking.objects.filter(
        equipment_id=data['equipment_id'],
        status__in=[Booking.STATUS_PENDING, Booking.STATUS_CONFIRMED],
    ).exclude(
        end_date__lte=data['start_date'],
    ).exclude(
        start_date__gte=data['end_date'],
    )
    available = not overlapping.exists()
    return Response({'available': available})


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def cancel_booking(request, pk):
    try:
        booking = Booking.objects.get(pk=pk, user=request.user)
    except Booking.DoesNotExist:
        return Response({'detail': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)

    if booking.start_date <= date.today():
        return Response(
            {'detail': 'Cannot cancel a booking that has already started.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    booking.status = Booking.STATUS_CANCELLED
    booking.save(update_fields=['status'])
    return Response(BookingSerializer(booking).data)


class BookingListCreateView(generics.ListCreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related('equipment')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
