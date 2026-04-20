from datetime import date
from rest_framework import serializers
from .models import Booking
from equipment.models import Equipment


class BookingSerializer(serializers.ModelSerializer):
    equipment_name = serializers.CharField(source='equipment.name', read_only=True)
    equipment_image = serializers.ImageField(source='equipment.image', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'equipment', 'equipment_name', 'equipment_image',
            'start_date', 'end_date', 'total_price', 'status', 'created_at',
        ]
        read_only_fields = ['total_price', 'status', 'created_at']

    def validate(self, data):
        start = data.get('start_date')
        end = data.get('end_date')

        if start and end:
            if start >= end:
                raise serializers.ValidationError({'end_date': 'End date must be after start date.'})
            if start < date.today():
                raise serializers.ValidationError({'start_date': 'Start date cannot be in the past.'})
            if (end - start).days > 90:
                raise serializers.ValidationError({'end_date': 'Rental period cannot exceed 90 days.'})

        equipment = data.get('equipment')
        if equipment and start and end:
            overlapping = Booking.objects.filter(
                equipment=equipment,
                status__in=[Booking.STATUS_PENDING, Booking.STATUS_CONFIRMED],
            ).exclude(
                end_date__lte=start,
            ).exclude(
                start_date__gte=end,
            )
            instance = self.instance
            if instance:
                overlapping = overlapping.exclude(pk=instance.pk)
            if overlapping.exists():
                raise serializers.ValidationError(
                    {'non_field_errors': 'Equipment is not available for the selected dates.'}
                )

        return data

    def create(self, validated_data):
        start = validated_data['start_date']
        end = validated_data['end_date']
        equipment = validated_data['equipment']
        days = (end - start).days
        validated_data['total_price'] = equipment.daily_rate * days
        return super().create(validated_data)


class AvailabilitySerializer(serializers.Serializer):
    equipment_id = serializers.IntegerField()
    start_date = serializers.DateField()
    end_date = serializers.DateField()

    def validate(self, data):
        if data['start_date'] >= data['end_date']:
            raise serializers.ValidationError({'end_date': 'End date must be after start date.'})
        if data['start_date'] < date.today():
            raise serializers.ValidationError({'start_date': 'Start date cannot be in the past.'})
        try:
            Equipment.objects.get(pk=data['equipment_id'])
        except Equipment.DoesNotExist:
            raise serializers.ValidationError({'equipment_id': 'Equipment not found.'})
        return data
