from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Expense
import datetime

class ExpenseAPITests(TestCase):
    def setUp(self):
        # API Client setup kiya gaya hai testing ke liye
        self.client = APIClient()
        self.valid_payload = {
            'title': 'Test Expense',
            'description': 'Description for test',
            'amount': '1500.50',
            'category': 'Food',
            'date': datetime.date.today().strftime('%Y-%m-%d')
        }
        self.invalid_payload = {
            'title': '',
            'amount': '-100',
            'category': '',
            'date': ''
        }
        # Ek dummy expense create kar rahe hai testing operations ke liye
        self.expense = Expense.objects.create(**{
            'title': 'Existing Expense',
            'amount': '500.00',
            'category': 'Travel',
            'date': '2023-10-10'
        })

    def test_create_expense_success(self):
        # Naya expense create hone ka test
        response = self.client.post('/api/expenses/', self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Expense.objects.count(), 2)

    def test_create_expense_validation_errors(self):
        # Jab required data na ho toh 400 aana chahiye ya negative amount ho
        response = self.client.post('/api/expenses/', self.invalid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('title', response.data['errors'])
        self.assertIn('amount', response.data['errors'])

    def test_list_expenses(self):
        # Database se saari list fetch hone ka test
        response = self.client.get('/api/expenses/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_update_expense(self):
        # Expense ka data update karne ka test (PUT request)
        update_data = {
            'title': 'Updated Expense',
            'amount': '600.00',
            'category': 'Travel',
            'date': '2023-10-11'
        }
        response = self.client.put(f'/api/expenses/{self.expense.id}/', update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.expense.refresh_from_db()
        self.assertEqual(self.expense.title, 'Updated Expense')
        self.assertEqual(self.expense.amount, 600.00)

    def test_delete_expense(self):
        # Delete API test karne ke liye (DELETE request)
        response = self.client.delete(f'/api/expenses/{self.expense.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Expense.objects.count(), 0)

    def test_dashboard_summary(self):
        # Dashboard API ka test jaha summary stats aate hai
        Expense.objects.create(title="Food 2", amount="1000.00", category="Food", date=datetime.date.today().strftime('%Y-%m-%d'))
        response = self.client.get('/api/dashboard-summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Total amount sholud be 500 (Travel) + 1000 (Food) = 1500
        self.assertEqual(response.data['total_spending'], 1500.00)
        self.assertEqual(response.data['top_category'], 'Food')
        self.assertEqual(len(response.data['category_totals']), 2)

    def test_categories_api(self):
        # Categories dynamically generate hone ka test
        Expense.objects.create(title="Food 2", amount="200.00", category="Food", date="2023-10-12")
        Expense.objects.create(title="Food 3", amount="300.00", category="Food", date="2023-10-13")
        # Existing category Travel aur nayi aayi Food
        response = self.client.get('/api/categories/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertIn('Travel', response.data)
        self.assertIn('Food', response.data)
