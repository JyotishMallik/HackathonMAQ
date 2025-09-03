# C:\Users\JyotishMallikMAQSoft\Downloads\Hackathon\backend\direct_import.py

import os
import sys
import pandas as pd
import json

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
django.setup()

# Import Django models
from django.contrib.auth import get_user_model
User = get_user_model()
from products.models import Category, Product, Review
from django.db.models import Avg

def import_data(excel_file):
    print(f"Starting import from: {excel_file}")
    
    # Open Excel file
    xl = pd.ExcelFile(excel_file)
    print(f"Found sheets: {', '.join(xl.sheet_names)}")
    
    # Process each sheet
    for sheet_name in xl.sheet_names:
        print(f"\nProcessing sheet: {sheet_name}")
        df = pd.read_excel(excel_file, sheet_name=sheet_name)
        print(f"Sheet has {len(df)} rows with columns: {list(df.columns)}")
        
        if 'users' in sheet_name.lower():
            import_users(df)
        elif 'categor' in sheet_name.lower():
            import_categories(df)
        elif 'product' in sheet_name.lower() and 'review' not in sheet_name.lower():
            import_products(df)
        elif 'review' in sheet_name.lower() or ('product' in sheet_name.lower() and 'customer_reviews' in df.columns):
            import_reviews(df)
        else:
            print(f"No import handler for sheet: {sheet_name}")

def import_users(df):
    count = 0
    
    for _, row in df.iterrows():
        if 'username' not in df.columns:
            print("'username' column is required for users")
            return
        
        try:
            username = row['username']
            defaults = {}
            
            # Add other fields if they exist
            for field in ['email', 'first_name', 'last_name']:
                if field in df.columns and pd.notna(row[field]):
                    defaults[field] = row[field]
            
            user, created = User.objects.get_or_create(username=username, defaults=defaults)
            
            if created:
                count += 1
                print(f"Created user: {username}")
            
            # Set password if provided
            if 'password' in df.columns and pd.notna(row['password']):
                user.set_password(row['password'])
                user.save()
                print(f"Set password for user: {username}")
        except Exception as e:
            print(f"Error creating user {row.get('username')}: {e}")
    
    print(f"Created {count} users")

def import_categories(df):
    count = 0
    
    for _, row in df.iterrows():
        if 'name' not in df.columns:
            print("'name' column is required for categories")
            return
        
        try:
            name = row['name']
            defaults = {}
            
            if 'description' in df.columns and pd.notna(row['description']):
                defaults['description'] = row['description']
            
            category, created = Category.objects.get_or_create(name=name, defaults=defaults)
            
            if created:
                count += 1
                print(f"Created category: {name}")
        except Exception as e:
            print(f"Error creating category {row.get('name')}: {e}")
    
    print(f"Created {count} categories")

def import_products(df):
    count = 0
    
    for _, row in df.iterrows():
        try:
            # Check if we have required fields
            if 'name' not in df.columns:
                print("'name' column is required for products")
                return
            
            name = row['name']
            
            # Get price
            price = 0
            if 'price' in df.columns and pd.notna(row['price']):
                price = float(row['price'])
            
            # Get category
            category = None
            if 'category_id' in df.columns and pd.notna(row['category_id']):
                try:
                    category = Category.objects.get(id=int(row['category_id']))
                except Category.DoesNotExist:
                    print(f"Category with ID {row['category_id']} not found. Creating a default category.")
                    category = Category.objects.create(name=f"Category for {name}")
            elif 'category' in df.columns and pd.notna(row['category']):
                # Try to get category by name
                category_name = row['category']
                category, _ = Category.objects.get_or_create(name=category_name)
            else:
                # Create a default category
                category = Category.objects.get_or_create(name="Uncategorized")[0]
            
            defaults = {
                'price': price,
                'category': category,
            }
            
            # Add optional fields if they exist
            for field in ['description', 'stock_quantity', 'rating', 'image']:
                if field in df.columns and pd.notna(row[field]):
                    defaults[field] = row[field]
            
            product, created = Product.objects.get_or_create(name=name, defaults=defaults)
            
            if created:
                count += 1
                print(f"Created product: {name}")
        except Exception as e:
            print(f"Error creating product {row.get('name')}: {e}")
    
    print(f"Created {count} products")

def import_reviews(df):
    # Track stats
    total_reviews = 0
    skipped_reviews = 0
    products_created = 0
    
    # Check if we have the new format (product_name + customer_reviews)
    if 'product_name' in df.columns and 'customer_reviews' in df.columns:
        print("Importing reviews from customer_reviews JSON column...")
        
        # Process each row (product)
        for _, row in df.iterrows():
            product_name = row['product_name']
            print(f"\nProcessing reviews for product: {product_name}")
            
            # Get or create the product
            try:
                product = Product.objects.get(name=product_name)
                print(f"Found existing product: {product_name} (ID: {product.id})")
            except Product.DoesNotExist:
                print(f"Product not found: {product_name}. Creating it...")
                # Create a default category if needed
                category, _ = Category.objects.get_or_create(name='Uncategorized')
                # Create the product
                product = Product.objects.create(
                    name=product_name,
                    description=f"Auto-created for reviews import: {product_name}",
                    price=0.00,  # Default price
                    category=category,
                )
                print(f"Created new product: {product_name} (ID: {product.id})")
                products_created += 1
            
            # Process customer reviews JSON
            reviews_data = row['customer_reviews']
            
            # Parse JSON if it's a string
            if isinstance(reviews_data, str):
                try:
                    reviews_data = json.loads(reviews_data)
                except json.JSONDecodeError:
                    print(f"Error: Invalid JSON for {product_name}: {reviews_data}")
                    continue
            
            # Process each review in the array
            if isinstance(reviews_data, list):
                print(f"Found {len(reviews_data)} reviews to import")
                
                for review_data in reviews_data:
                    try:
                        # Check if we have required data
                        if 'rating' not in review_data:
                            print("Skipping review - missing rating")
                            skipped_reviews += 1
                            continue
                        
                        # Get user ID from the review data
                        user_id = review_data.get('user_id')
                        if not user_id:
                            # If no user_id is provided, use user ID 1 as default
                            user_id = 1
                            print(f"No user_id found, using default: {user_id}")
                        
                        # Find the user
                        try:
                            user = User.objects.get(id=user_id)
                        except User.DoesNotExist:
                            print(f"User with ID {user_id} not found. Creating a placeholder user.")
                            # Create a username from reviewer name or use a default
                            if 'name' in review_data and review_data['name'] and review_data['name'] != 'null':
                                # Clean the username - replace problematic characters
                                username = ''.join(c if c.isalnum() or c == '_' else '_' for c in str(review_data['name']))
                                username = username[:30]  # Limit username length
                                if not username:
                                    username = f"reviewer_{user_id}"
                            else:
                                username = f"reviewer_{user_id}"
                            
                            user = User.objects.create(
                                username=username,
                                email=f"{username.lower().replace(' ', '_')}@example.com"
                            )
                        
                        # Extract review data
                        rating = int(review_data['rating'])
                        review_text = review_data.get('review', '')
                        
                        # Create the review
                        review, created = Review.objects.get_or_create(
                            product=product,
                            user=user,
                            defaults={
                                'rating': rating,
                                'comment': review_text,
                            }
                        )
                        
                        if created:
                            total_reviews += 1
                            print(f"Created review: {rating} stars by {user.username}")
                        else:
                            print(f"Review by {user.username} for this product already exists")
                    
                    except Exception as e:
                        print(f"Error processing review: {str(e)}")
                        skipped_reviews += 1
                
                # Update product rating
                avg_rating = Review.objects.filter(product=product).aggregate(Avg('rating'))['rating__avg']
                if avg_rating:
                    product.rating = avg_rating
                    product.save()
                    print(f"Updated product rating to {avg_rating:.2f}")
            else:
                print(f"Error: 'customer_reviews' is not a list for product {product_name}")
    
    # Handle old format with product_id and user_id columns
    else:
        print("Importing reviews from traditional columns...")
        count = 0
        
        for _, row in df.iterrows():
            try:
                # We need product_id, user_id, and rating at minimum
                product_id = row.get('product_id')
                user_id = row.get('user_id')
                
                if not pd.notna(product_id) or not pd.notna(user_id):
                    print("Missing product_id or user_id for review")
                    skipped_reviews += 1
                    continue
                
                # Get rating (default to 5 if missing)
                rating = 5
                if 'rating' in df.columns and pd.notna(row['rating']):
                    rating = int(row['rating'])
                
                # Get product and user
                try:
                    product = Product.objects.get(id=int(product_id))
                except Product.DoesNotExist:
                    print(f"Product with ID {product_id} not found, skipping review")
                    skipped_reviews += 1
                    continue
                
                try:
                    user = User.objects.get(id=int(user_id))
                except User.DoesNotExist:
                    print(f"User with ID {user_id} not found, skipping review")
                    skipped_reviews += 1
                    continue
                
                defaults = {'rating': rating}
                
                # Add comment if available
                if 'comment' in df.columns and pd.notna(row['comment']):
                    defaults['comment'] = row['comment']
                
                review, created = Review.objects.get_or_create(
                    product=product,
                    user=user,
                    defaults=defaults
                )
                
                if created:
                    count += 1
                    total_reviews += 1
                    print(f"Created review for {product.name} by {user.username}")
            except Exception as e:
                print(f"Error creating review: {e}")
                skipped_reviews += 1
    
    # Print summary
    print("\n=== Reviews Import Summary ===")
    print(f"Total reviews created: {total_reviews}")
    print(f"Reviews skipped: {skipped_reviews}")
    if products_created > 0:
        print(f"Products created: {products_created}")

if __name__ == "__main__":
    # Get Excel file path
    excel_file = "C:\\Users\\JyotishMallikMAQSoft\\Downloads\\Hackathon\\data\\data_demo.xlsx"
    if len(sys.argv) > 1:
        excel_file = sys.argv[1]
    
    if not os.path.exists(excel_file):
        print(f"Error: File not found: {excel_file}")
        sys.exit(1)
    
    import_data(excel_file)