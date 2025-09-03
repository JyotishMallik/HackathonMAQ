# C:\Users\JyotishMallikMAQSoft\Downloads\Hackathon\backend\import_data.py

import os
import sys
import pandas as pd
import json

# First, set up the Python path properly
# This ensures Python can find your Django project modules
current_path = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_path)

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Now initialize Django
import django
django.setup()

# After Django is initialized, we can import Django models
from django.db import transaction
from django.db.models import Avg
from django.contrib.auth import get_user_model
User = get_user_model()
from products.models import Category, Product, Review

def print_separator(message):
    """Print a separator line with message for better readability"""
    print("\n" + "=" * 40)
    print(message)
    print("=" * 40 + "\n")

def main():
    """Main function that processes the Excel file"""
    # Default file path with command-line override
    excel_file = "C:\\Users\\JyotishMallikMAQSoft\\Downloads\\Hackathon\\data\\data_demo.xlsx"
    if len(sys.argv) > 1:
        excel_file = sys.argv[1]
        
    # Verify file exists
    if not os.path.exists(excel_file):
        print(f"Error: File not found: {excel_file}")
        return

    try:
        print_separator(f"Starting import from: {excel_file}")
        
        # Open Excel file
        xl = pd.ExcelFile(excel_file)
        print(f"Found sheets: {', '.join(xl.sheet_names)}")
        
        # Process each sheet
        for sheet_name in xl.sheet_names:
            print_separator(f"Processing sheet: {sheet_name}")
            
            # Read the data from the sheet
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            
            if df.empty:
                print(f"Sheet {sheet_name} is empty. Skipping.")
                continue
                
            # Show a sample of the data
            print(f"Sheet has {len(df)} rows with columns: {list(df.columns)}")
            if len(df) > 0:
                print("\nSample data (first row):")
                print(df.iloc[0])
            
            # Process based on sheet name
            if sheet_name.lower() == 'users':
                import_users(df)
            elif sheet_name.lower() == 'categories':
                import_categories(df)
            elif sheet_name.lower() == 'products':
                import_products(df)
            elif sheet_name.lower() == 'reviews':
                import_reviews(df)
            else:
                print(f"No import handler for sheet: {sheet_name}. Skipping.")
                
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()

@transaction.atomic
def import_users(df):
    """Import users from DataFrame"""
    required_fields = ['username', 'email']
    if not all(field in df.columns for field in required_fields):
        print(f"Missing required fields for users: {required_fields}")
        return
    
    count = 0
    for _, row in df.iterrows():
        try:
            # Extract user data
            username = row['username']
            email = row['email']
            
            # Create or update user
            user, created = User.objects.update_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': row.get('first_name', ''),
                    'last_name': row.get('last_name', ''),
                    # Handle is_admin field if present
                    'is_staff': row.get('is_admin', False) in [True, 'TRUE', 'True', 'true', 1, '1'],
                    'is_superuser': row.get('is_admin', False) in [True, 'TRUE', 'True', 'true', 1, '1'],
                }
            )
            
            # Set password if provided
            if 'password' in row and pd.notna(row['password']):
                user.set_password(str(row['password']))
                user.save()
            
            if created:
                count += 1
                print(f"Created user: {username}")
            else:
                print(f"Updated user: {username}")
        except Exception as e:
            print(f"Error importing user {row.get('username')}: {str(e)}")
    
    print(f"Successfully imported {count} new users")

@transaction.atomic
def import_categories(df):
    """Import categories from DataFrame"""
    required_fields = ['name']
    if not all(field in df.columns for field in required_fields):
        print(f"Missing required fields for categories: {required_fields}")
        return
    
    count = 0
    for _, row in df.iterrows():
        try:
            name = row['name']
            description = row.get('description', '')
            
            category, created = Category.objects.update_or_create(
                name=name,
                defaults={'description': description}
            )
            
            if created:
                count += 1
                print(f"Created category: {name}")
            else:
                print(f"Updated category: {name}")
        except Exception as e:
            print(f"Error importing category {row.get('name')}: {str(e)}")
    
    print(f"Successfully imported {count} new categories")

@transaction.atomic
def import_products(df):
    """Import products from DataFrame"""
    required_fields = ['name', 'price', 'category']
    if not all(field in df.columns for field in required_fields):
        print(f"Missing required fields for products: {required_fields}")
        return
    
    count = 0
    for _, row in df.iterrows():
        try:
            name = row['name']
            price = float(row['price'])
            category_name = row['category']
            
            # Get or create category
            try:
                category = Category.objects.get(name=category_name)
            except Category.DoesNotExist:
                print(f"Creating missing category: {category_name}")
                category = Category.objects.create(name=category_name)
            
            # Create or update product
            product, created = Product.objects.update_or_create(
                name=name,
                defaults={
                    'price': price,
                    'description': row.get('description', ''),
                    'category': category,
                    'stock_quantity': int(row.get('stock_quantity', 0)),
                    'rating': float(row.get('rating', 0.0)),
                    'image': row.get('image', None),
                }
            )
            
            if created:
                count += 1
                print(f"Created product: {name}")
            else:
                print(f"Updated product: {name}")
        except Exception as e:
            print(f"Error importing product {row.get('name')}: {str(e)}")
    
    print(f"Successfully imported {count} new products")

@transaction.atomic
def import_reviews(df):
    """Import reviews from DataFrame"""
    required_fields = ['product_name', 'customer_reviews']
    if not all(field in df.columns for field in required_fields):
        print(f"Missing required fields for reviews: {required_fields}")
        return
    
    total_products = 0
    total_reviews = 0
    skipped_reviews = 0
    
    for _, row in df.iterrows():
        try:
            product_name = row['product_name']
            print(f"Processing reviews for product: {product_name}")
            
            # Find or create product
            try:
                product = Product.objects.get(name=product_name)
                print(f"Found existing product: {product_name}")
            except Product.DoesNotExist:
                print(f"Creating missing product: {product_name}")
                category, _ = Category.objects.get_or_create(name='Uncategorized')
                product = Product.objects.create(
                    name=product_name,
                    description=f'Auto-created from reviews import',
                    price=0.00,  # Default price
                    category=category
                )
                total_products += 1
            
            # Process reviews from JSON
            reviews_data = row['customer_reviews']
            if isinstance(reviews_data, str):
                try:
                    reviews_data = json.loads(reviews_data)
                except json.JSONDecodeError:
                    print(f"Invalid JSON for {product_name}: {reviews_data}")
                    continue
            
            if isinstance(reviews_data, list):
                print(f"Found {len(reviews_data)} reviews to import")
                
                for review_data in reviews_data:
                    try:
                        if 'rating' not in review_data:
                            print("Skipping review without rating")
                            skipped_reviews += 1
                            continue
                        
                        rating = review_data.get('rating')
                        review_text = review_data.get('review', '')
                        reviewer_name = review_data.get('name', '')
                        
                        # Create user for reviewer
                        if reviewer_name and reviewer_name != "null":
                            # Clean username - keep alphanumeric and underscore
                            username = ''.join(c if c.isalnum() or c == '_' else '_' for c in str(reviewer_name))
                            username = username[:30]  # Ensure username isn't too long
                            
                            user, user_created = User.objects.get_or_create(
                                username=username,
                                defaults={
                                    'email': f'{username}@example.com',  # Placeholder email
                                    'first_name': reviewer_name,
                                }
                            )
                            if user_created:
                                print(f"Created user: {username}")
                        else:
                            # Use anonymous user
                            user, _ = User.objects.get_or_create(
                                username='anonymous',
                                defaults={
                                    'email': 'anonymous@example.com',
                                    'first_name': 'Anonymous',
                                }
                            )
                        
                        # Create review
                        review, created = Review.objects.get_or_create(
                            product=product,
                            user=user,
                            defaults={
                                'rating': int(rating),
                                'comment': review_text or '',
                            }
                        )
                        
                        if created:
                            total_reviews += 1
                            print(f"Created review: Rating {rating} by {user.username}")
                    except Exception as e:
                        print(f"Error processing review: {str(e)}")
                        skipped_reviews += 1
            
            # Update product rating based on all reviews
            avg_rating = Review.objects.filter(product=product).aggregate(Avg('rating'))['rating__avg']
            if avg_rating:
                product.rating = avg_rating
                product.save()
                print(f"Updated product rating to {avg_rating:.1f}")
        except Exception as e:
            print(f"Error processing reviews for {row.get('product_name')}: {str(e)}")
    
    print_separator("Reviews import summary")
    print(f"Products created: {total_products}")
    print(f"Reviews imported: {total_reviews}")
    print(f"Reviews skipped: {skipped_reviews}")

if __name__ == "__main__":
    main()