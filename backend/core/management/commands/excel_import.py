from django.core.management.base import BaseCommand
import pandas as pd
import json
from django.db import transaction
from django.db.models import Avg
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Import data from Excel file'

    def add_arguments(self, parser):
        parser.add_argument('excel_file', type=str, help='Path to Excel file')

    def handle(self, *args, **options):
        excel_file = options['excel_file']
        self.stdout.write(self.style.SUCCESS(f"Starting import from: {excel_file}"))
        
        try:
            # Read the Excel file
            xl = pd.ExcelFile(excel_file)
            self.stdout.write(self.style.SUCCESS(f"Found sheets: {', '.join(xl.sheet_names)}"))
            
            # Process each sheet
            for sheet_name in xl.sheet_names:
                self.stdout.write(f"Processing sheet: {sheet_name}")
                df = pd.read_excel(excel_file, sheet_name=sheet_name)
                self.stdout.write(f"Sheet has {len(df)} rows with columns: {list(df.columns)}")
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error: {str(e)}"))
