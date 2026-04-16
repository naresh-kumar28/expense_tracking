from django.urls import path
from . import views

urlpatterns = [
    # Yaha sabhi expenses lane aur naya banane ka route hai
    path('expenses/', views.expenses_list_create, name='expenses-list-create'),
    
    # Ye specific expense ko manage karne ke liye (GET by ID, PUT, DELETE)
    path('expenses/<int:pk>/', views.expense_detail_update_delete, name='expense-detail'),
    
    # Dashboard ka summary data lane ka route
    path('dashboard-summary/', views.dashboard_summary, name='dashboard-summary'),
    
    # Distinct categories lane ka route
    path('categories/', views.categories_list, name='categories-list'),
]
