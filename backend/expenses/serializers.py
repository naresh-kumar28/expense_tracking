from rest_framework import serializers
from .models import Expense

# Ye class Expense model ko JSON format mein convert karegi (Converts Expense model to JSON)
class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'
