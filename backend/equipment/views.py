from rest_framework import viewsets, filters
from rest_framework.permissions import IsAdminUser, AllowAny, IsAuthenticatedOrReadOnly
from .models import Equipment
from .serializers import EquipmentSerializer


class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.select_related('category').all()
    serializer_class = EquipmentSerializer

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdminUser()]
        return [AllowAny()]

    def get_queryset(self):
        qs = Equipment.objects.select_related('category').all()
        category = self.request.query_params.get('category')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        is_available = self.request.query_params.get('is_available')

        if category:
            qs = qs.filter(category__slug=category)
        if min_price:
            qs = qs.filter(daily_rate__gte=min_price)
        if max_price:
            qs = qs.filter(daily_rate__lte=max_price)
        if is_available is not None:
            qs = qs.filter(is_available=is_available.lower() in ('true', '1', 'yes'))
        return qs
