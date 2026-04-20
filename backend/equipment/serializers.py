from rest_framework import serializers
from .models import Category, Equipment


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description']


class EquipmentSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source='category', read_only=True)

    class Meta:
        model = Equipment
        fields = [
            'id', 'name', 'description', 'category', 'category_detail',
            'daily_rate', 'image', 'is_available',
        ]
