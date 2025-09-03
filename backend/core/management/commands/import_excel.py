from django.core.management.base import BaseCommand
import pandas as pd
import json
from django.db import transaction
from django.db.models import Avg
from django.contrib.auth import get_user_model
User = get_user_model()

# Import models - adjust as needed for your project
try:
    from products.models import Category, Product, Review
except ImportError as e:
    print(f"Error importing models: {e}")
    # You might need to adjust the import paths based on your project structure

class Command(BaseCommand):
    help = 'Import data from Excel file'

    def add_arguments(self, parser):
        parser.add_argument('excel_file', type=str, help='Path to Excel file')

    def handle(self, *args, **options):
        excel_file = options['excel_file']
        self.stdout.write(self.style.SUCCESS(f"Starting import from: {excel_file}"))
        
        try:
            xl = pd.ExcelFile(excel_file)
            self.stdout.write(self.style.SUCCESS(f"Found sheets: {', '.join(xl.sheet_names)}"))
            
            for sheet_name in xl.sheet_names:
                self.stdout.write(f"Processing sheet: {sheet_name}")
                df = pd.read_excel(excel_file, sheet_name=sheet_name)
                
                if df.empty:
                    self.stdout.write(self.style.WARNING(f"Sheet {sheet_name} is empty. Skipping."))
                    continue
                
                self.stdout.write(f"Sheet has {len(df)} rows with columns: {list(df.columns)}")
                
                if sheet_name.lower() == 'users':
                    self.import_users(df)
                elif sheet_name.lower() == 'categories':
                    self.import_categories(df)
                elif sheet_name.lower() == 'products':
                    self.import_products(df)
                elif sheet_name.lower() == 'reviews':
                    self.import_reviews(df)
                else:
                    self.stdout.write(self.style.WARNING(f"No import handler for sheet: {sheet_name}. Skipping."))
                    
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error processing Excel file: {str(e)}"))
            import traceback
            traceback.print_exc()
    
    @transaction.atomic
    def import_users(self, df):
        required_fields = ['username', 'email']
        if not all(field in df.columns for field in required_fields):
            self.stderr.write(self.style.ERROR(f"Missing required fields for users: {required_fields}"))
            return

        count = 0
        for _, row in df.iterrows():
            try:
                user, created = User.objects.update_or_create(
                    username=row['username'],
                    defaults={
                        'email': row['email'],
                        'first_name': row.get('first_name', ''),
                        'last_name': row.get('last_name', ''),
                        'is_staff': row.get('is_admin', False) in [True, 'TRUE', 'True', 'true', 1, '1'],
                        'is_superuser': row.get('is_admin', False) in [True, 'TRUE', 'True', 'true', 1, '1'],
                    }
                )
                
                if 'password' in row and pd.notna(row['password']):
                    user.set_password(str(row['password']))
                    user.save()
                
                if created:
                    count += 1
                    self.stdout.write(f"Created user: {row['username']}")
                else:
                    self.stdout.write(f"Updated user: {row['username']}")
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"Error importing user {row.get('username')}: {str(e)}"))
                
        self.stdout.write(self.style.SUCCESS(f"Successfully imported {count} new users"))

    @transaction.atomic
    def import_categories(self, df):
        from products.models import Category
        
        required_fields = ['name']
        if not all(field in df.columns for field in required_fields):
            self.stderr.write(self.style.ERROR(f"Missing required fields for categories: {required_fields}"))
            return
            
        count = 0
        for _, row in df.iterrows():
            try:
                _, created = Category.objects.update_or_create(
                    name=row['name'],
                    defaults={
                        'description': row.get('description', ''),
                    }
                )
                if created:
                    count += 1
                    self.stdout.write(f"Created category: {row['name']}")
                else:
                    self.stdout.write(f"Updated category: {row['name']}")
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"Error importing category {row.get('name')}: {str(e)}"))
                
        self.stdout.write(self.style.SUCCESS(f"Successfully imported {count} new categories"))

    @transaction.atomic
    def import_products(self, df):
        from products.models import Product, Category
        
        required_fields = ['name', 'price', 'category']
        if not all(field in df.columns for field in required_fields):
            self.stderr.write(self.style.ERROR(f"Missing required fields for products: {required_fields}"))
            return
            
        count = 0
        for _, row in df.iterrows():
            try:
                # Get or create category
                try:
                    category = Category.objects.get(name=row['category'])
                except Category.DoesNotExist:
                    category = Category.objects.create(name=row['category'])
                    self.stdout.write(f"Created missing category: {row['category']}")
                    
                # Create product
                product, created = Product.objects.update_or_create(
                    name=row['name'],
                    defaults={
                        'price': float(row['price']),
                        'description': row.get('description', ''),
                        'category': category,
                        'stock_quantity': int(row.get('stock_quantity', 0)),
                        'rating': float(row.get('rating', 0.0)),
                        'image': row.get('image', None),
                    }
                )
                if created:
                    count += 1
                    self.stdout.write(f"Created product: {row['name']}")
                else:
                    self.stdout.write(f"Updated product: {row['name']}")
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"Error importing product {row.get('name')}: {str(e)}"))
                
        self.stdout.write(self.style.SUCCESS(f"Successfully imported {count} new products"))

    @transaction.atomic
    def import_reviews(self, df):
        from products.models import Product, Review
        
        required_fields = ['product_name', 'customer_reviews']
        if not all(field in df.columns for field in required_fields):
            self.stderr.write(self.style.ERROR(f"Missing required fields for reviews: {required_fields}"))
            return
            
        # Track counts
        total_products = 0
        total_reviews = 0
        skipped_reviews = 0
        
        for _, row in df.iterrows():
            try:
                # Find product by name
                product_name = row['product_name']
                self.stdout.write(f"Processing reviews for: {product_name}")
                
                try:
                    product = Product.objects.get(name=product_name)
                except Product.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f"Product not found: {product_name}. Creating it..."))
                    # Create a placeholder product if it doesn't exist
                    category, _ = Category.objects.get_or_create(name='Uncategorized')
                    product = Product.objects.create(
                        name=product_name,
                        description=f'Auto-created from reviews import for {product_name}',
                        price=0.00,  # Default price, update later
                        category=category
                    )
                    total_products += 1
                    
                # Parse the customer_reviews JSON
                reviews_data = row['customer_reviews']
                if isinstance(reviews_data, str):
                    try:
                        reviews_data = json.loads(reviews_data)
                    except json.JSONDecodeError:
                        self.stderr.write(self.style.ERROR(f"Invalid JSON for {product_name}: {reviews_data}"))
                        continue
                
                # Process each review in the array
                if isinstance(reviews_data, list):
                    self.stdout.write(f"Found {len(reviews_data)} reviews")
                    
                    for review_data in reviews_data:
                        try:
                            # Skip reviews without required data
                            if 'rating' not in review_data:
                                skipped_reviews += 1
                                continue
                                
                            rating = review_data.get('rating')
                            review_text = review_data.get('review', '')
                            reviewer_name = review_data.get('name', '')
                            
                            # Create a user for the reviewer or use anonymous user
                            if reviewer_name and reviewer_name != "null":
                                # Sanitize username - replace non-alphanumeric chars
                                username = ''.join(c if c.isalnum() or c == '_' else '_' for c in str(reviewer_name))
                                username = username[:30]  # Django username max length
                                
                                user, created = User.objects.get_or_create(
                                    username=username,
                                    defaults={
                                        'email': f'{username}@example.com',  # Placeholder email
                                        'first_name': reviewer_name,
                                    }
                                )
                                if created:
                                    self.stdout.write(f"Created user for reviewer: {username}")
                            else:
                                # Use anonymous user
                                user, _ = User.objects.get_or_create(
                                    username='anonymous',
                                    defaults={
                                        'email': 'anonymous@example.com',
                                        'first_name': 'Anonymous',
                                    }
                                )
                            
                            # Create the review
                            review, created = Review.objects.update_or_create(
                                product=product,
                                user=user,
                                defaults={
                                    'rating': int(rating),
                                    'comment': review_text or '',
                                }
                            )
                            
                            if created:
                                total_reviews += 1
                                self.stdout.write(f"Created review: {rating} stars by {user.username}")
                                
                        except Exception as e:
                            self.stderr.write(self.style.ERROR(f"Error processing review for {product_name}: {str(e)}"))
                            skipped_reviews += 1
                
                # Update product rating after all reviews
                from django.db.models import Avg
                avg_rating = Review.objects.filter(product=product).aggregate(Avg('rating'))['rating__avg']
                if avg_rating:
                    product.rating = avg_rating
                    product.save()
                    self.stdout.write(f"Updated product rating to {avg_rating}")
                    
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"Error processing reviews for {row.get('product_name')}: {str(e)}"))
                    
        self.stdout.write(self.style.SUCCESS(
            f"Reviews import complete:\n"
            f"- Products created: {total_products}\n"
            f"- Reviews imported: {total_reviews}\n"
            f"- Reviews skipped: {skipped_reviews}"
        ))
