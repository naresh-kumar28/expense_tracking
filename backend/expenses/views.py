from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from datetime import datetime
from .models import Expense
from .serializers import ExpenseSerializer

# Sabhi expenses fetch karne ya naya expense create karne ka API
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def expenses_list_create(request):
    if request.method == 'GET':
        if not request.user.is_authenticated:
            return Response([])
            
        # Database se sirf current user ke expenses nikal rahe hai
        expenses = Expense.objects.filter(user=request.user).order_by('-date', '-created_at')
        serializer = ExpenseSerializer(expenses, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'error': 'Login required to add expense'}, status=status.HTTP_401_UNAUTHORIZED)
            
        # Request body se sidha data get kar rahe hai
        description = request.data.get('description', '')
        amount = request.data.get('amount')
        category = request.data.get('category')
        date = request.data.get('date')

        # Basic validations
        errors = {}
        if not amount or float(amount) <= 0:
            errors['amount'] = 'Amount must be greater than zero'
        if not category:
            errors['category'] = 'Category is required'
        if not date:
            errors['date'] = 'Date is required'

        if errors:
            return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

        # Naya expense save kar rahe hai
        expense = Expense.objects.create(
            user=request.user,
            description=description,
            amount=amount,
            category=category,
            date=date
        )
        serializer = ExpenseSerializer(expense)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# Specific expense ko dekhne, update karne ya delete karne ka API
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny]) # GET is public but specific item is only for owner
def expense_detail_update_delete(request, pk):
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
    try:
        expense = Expense.objects.get(pk=pk, user=request.user)
    except Expense.DoesNotExist:
        return Response({'error': 'Expense not found or unauthorized'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ExpenseSerializer(expense)
        return Response(serializer.data)

    elif request.method == 'PUT':
        description = request.data.get('description', expense.description)
        amount = request.data.get('amount', expense.amount)
        category = request.data.get('category', expense.category)
        date = request.data.get('date', expense.date)

        if amount and float(amount) <= 0:
            return Response({'error': 'Amount must be greater than zero'}, status=status.HTTP_400_BAD_REQUEST)

        expense.description = description
        expense.amount = amount
        expense.category = category
        expense.date = date
        expense.save()

        serializer = ExpenseSerializer(expense)
        return Response(serializer.data)

    elif request.method == 'DELETE':
        expense.delete()
        return Response({'message': 'Expense deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

# Dashboard me dikhane ke liye summaries aur statistics ka API
@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_summary(request):
    if not request.user.is_authenticated:
        return Response({
            'total_spending': 0,
            'current_month_spending': 0,
            'top_category': None,
            'top_category_amount': 0,
            'category_totals': [],
            'recent_expenses': [],
        })
        
    expenses = Expense.objects.filter(user=request.user)
    
    total_spending = expenses.aggregate(Sum('amount'))['amount__sum'] or 0
    today = datetime.today()
    current_month_expenses = expenses.filter(date__year=today.year, date__month=today.month)
    current_month_spending = current_month_expenses.aggregate(Sum('amount'))['amount__sum'] or 0

    category_totals = []
    top_category = None
    max_amount = 0

    categories = list(set(expenses.values_list('category', flat=True)))
    
    for cat in categories:
        cat_amount = expenses.filter(category=cat).aggregate(Sum('amount'))['amount__sum'] or 0
        category_totals.append({'name': cat, 'value': cat_amount})
        if cat_amount > max_amount:
            max_amount = cat_amount
            top_category = cat

    recent_expenses = expenses.order_by('-date', '-created_at')[:5]
    recent_serializer = ExpenseSerializer(recent_expenses, many=True)

    data = {
        'total_spending': total_spending,
        'current_month_spending': current_month_spending,
        'top_category': top_category,
        'top_category_amount': max_amount,
        'category_totals': category_totals,
        'recent_expenses': recent_serializer.data,
    }
    return Response(data)

# Distinct save ki hui categories ka API
@api_view(['GET'])
@permission_classes([AllowAny])
def categories_list(request):
    if not request.user.is_authenticated:
        return Response([])
        
    categories = Expense.objects.filter(user=request.user).values_list('category', flat=True).distinct()
    return Response(list(categories))
