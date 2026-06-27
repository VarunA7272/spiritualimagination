import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Category {
  name: string;
  subcategories: string[];
}

interface Product {
  name: string;
  category: string;
  subcategory?: string;
  size: string;
  price: string;
  desc: string;
  code: string;
  icon: string;
  image?: string;
  images?: string[];
}

@Component({
  selector: 'app-admin-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-upload.component.html',
  styleUrls: ['./admin-upload.component.css']
})
export class AdminUploadComponent implements OnInit {
  activeTab: 'products' | 'categories' = 'products';

  icons = [
    { label: 'Label/Tag', value: '🏷️' },
    { label: 'Light/LED', value: '💡' },
    { label: 'Wood/MDF', value: '🪵' },
    { label: 'Mirror', value: '🪞' },
    { label: 'Picture Frame', value: '🖼️' },
    { label: 'Pencil', value: '✏️' },
    { label: 'Art Palette', value: '🎨' },
    { label: 'Rakhi Thread', value: '📿' },
    { label: 'Coffee Mug', value: '☕' },
    { label: 'Cushion/Pillow', value: '🛋️' }
  ];

  // Dynamic Categories Data
  categories: Category[] = [];
  subcategories: string[] = [];

  // Form Model
  name = '';
  category = '';
  subcategory = '';
  size = '';
  price = '';
  desc = '';
  code = '';
  selectedIcon = '🏷️';
  imagePreviewUrls: string[] = [];

  // Edit State
  editingProductCode: string | null = null;

  // Category Manage Form Model
  newCategoryName = '';
  newSubcategoryNames: { [key: string]: string } = {};

  // State
  products: Product[] = [];
  successMessage = '';
  errorMessage = '';

  // CSV Import State
  importFile: File | null = null;
  csvProducts: Product[] = [];
  csvConflictAction: 'skip' | 'overwrite' = 'skip';
  csvErrors: string[] = [];
  csvNewCount = 0;
  csvConflictCount = 0;
  csvSuccessMessage = '';
  csvErrorMessage = '';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    if (!isPlatformBrowser(this.platformId)) return;

    const saved = localStorage.getItem('si_categories');
    if (saved) {
      try {
        this.categories = JSON.parse(saved);
      } catch (err) {
        console.error('Error parsing categories', err);
        this.loadDefaultCategories();
      }
    } else {
      this.loadDefaultCategories();
    }

    if (this.categories.length > 0) {
      this.category = this.categories[0].name;
      this.onCategoryChange();
    }
  }

  loadDefaultCategories() {
    this.categories = [
      { name: 'Name Plates', subcategories: ['Acrylic', 'LED Backlit', 'Wooden', 'MDF Board'] },
      { name: 'LED & Photo Frames', subcategories: ['Magic Mirrors', 'Couple Standees', 'Collage Frames', 'Canvas Frames'] },
      { name: 'Sketches & Paintings', subcategories: ['Pencil Sketches', 'Oil Paintings', 'Acrylic Canvas'] },
      { name: 'Metal Rakhis', subcategories: ['Name Rakhis', 'Photo Rakhis'] },
      { name: 'Mugs & Gifting', subcategories: ['Custom Mugs', 'Photo Cushions'] }
    ];
    this.saveCategoriesToStorage();
  }

  saveCategoriesToStorage() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('si_categories', JSON.stringify(this.categories));
    }
  }

  onCategoryChange() {
    const catObj = this.categories.find(c => c.name === this.category);
    this.subcategories = catObj ? catObj.subcategories : [];
    this.subcategory = this.subcategories.length > 0 ? this.subcategories[0] : '';
  }

  loadProducts() {
    if (!isPlatformBrowser(this.platformId)) return;

    const saved = localStorage.getItem('si_products');
    if (saved) {
      try {
        this.products = JSON.parse(saved);
      } catch (err) {
        console.error('Error parsing saved products', err);
        this.loadDefaultProducts();
      }
    } else {
      this.loadDefaultProducts();
    }
  }

  loadDefaultProducts() {
    this.products = [
      { name: 'Acrylic Golden Name Plate', category: 'Name Plates', subcategory: 'Acrylic', size: '15x24 Inch', price: '₹1,800', desc: 'Premium acrylic base with metallic golden letters.', code: 'JZZ4501', icon: '🏷️' },
      { name: 'Basuri Vadak Name Plate', category: 'Name Plates', subcategory: 'Wooden', size: '8x15 Inch', price: '₹1,000', desc: 'Beautiful flute theme wooden-finish acrylic plate.', code: 'GZZ4801', icon: '🏷️' },
      { name: 'Glowing LED Name Plate', category: 'Name Plates', subcategory: 'LED Backlit', size: '6x12 Inch', price: '₹1,000', desc: 'Warm backlit LED plate with custom engravings.', code: 'GZZ4802', icon: '💡' },
      { name: 'LED Mirror Photo Frame', category: 'LED & Photo Frames', subcategory: 'Magic Mirrors', size: '12x18 Inch', price: '₹999', desc: 'Magic mirror with LED lights showing custom photo.', code: 'FZZ-2', icon: '🪞' },
      { name: 'Handmade Pencil Sketch (Single)', category: 'Sketches & Paintings', subcategory: 'Pencil Sketches', size: '8x12 Inch', price: '₹500', desc: 'Realistic pencil drawing by our skilled artists.', code: 'SK-01', icon: '✏️' },
      { name: 'Engraved Metal Name Rakhi', category: 'Metal Rakhis', subcategory: 'Name Rakhis', size: 'Standard', price: '₹130', desc: 'Premium metal rakhi personalized with name.', code: 'RK-01', icon: '📿' }
    ];
    this.saveToStorage();
  }

  saveToStorage() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('si_products', JSON.stringify(this.products));
    }
  }

  async onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const compressedDataUrl = await this.compressImage(file);
        this.imagePreviewUrls.push(compressedDataUrl);
      } catch (err) {
        console.error('Error compressing file', file.name, err);
      }
    }
    
    // Reset file input
    event.target.value = '';
  }

  compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 500;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          } else {
            reject(new Error('Canvas context could not be created'));
          }
        };
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsDataURL(file);
    });
  }

  removeUploadedImage(idx: number) {
    this.imagePreviewUrls.splice(idx, 1);
  }

  clearAllImages() {
    this.imagePreviewUrls = [];
  }

  onSubmit() {
    if (!this.name || !this.size || !this.price || !this.code) {
      this.errorMessage = 'Please fill out all required fields.';
      return;
    }

    const trimmedCode = this.code.trim().toUpperCase();

    // Check if code already exists (when not editing, or if editing and code changed)
    if (
      (!this.editingProductCode && this.products.some(p => p.code === trimmedCode)) ||
      (this.editingProductCode && this.editingProductCode !== trimmedCode && this.products.some(p => p.code === trimmedCode))
    ) {
      this.errorMessage = `A product with code "${trimmedCode}" already exists.`;
      return;
    }

    const productData: Product = {
      name: this.name.trim(),
      category: this.category,
      subcategory: this.subcategory || undefined,
      size: this.size.trim(),
      price: this.price.startsWith('₹') ? this.price.trim() : '₹' + this.price.trim(),
      desc: this.desc.trim(),
      code: trimmedCode,
      icon: this.selectedIcon,
      image: this.imagePreviewUrls.length > 0 ? this.imagePreviewUrls[0] : undefined,
      images: this.imagePreviewUrls.length > 0 ? this.imagePreviewUrls : undefined
    };

    if (this.editingProductCode) {
      // Update existing product
      const idx = this.products.findIndex(p => p.code === this.editingProductCode);
      if (idx !== -1) {
        this.products[idx] = productData;
      }
      this.editingProductCode = null;
      this.successMessage = '✓ Product updated successfully!';
    } else {
      // Add new product
      this.products.unshift(productData);
      this.successMessage = '✓ Product uploaded successfully!';
    }

    this.saveToStorage();
    this.resetForm();
    this.errorMessage = '';

    setTimeout(() => (this.successMessage = ''), 3500);
  }

  editProduct(product: Product) {
    this.editingProductCode = product.code;
    this.name = product.name;
    this.category = product.category;
    
    // Load subcategories list for this category
    const catObj = this.categories.find(c => c.name === this.category);
    this.subcategories = catObj ? catObj.subcategories : [];
    this.subcategory = product.subcategory || '';
    
    this.size = product.size;
    this.price = product.price.startsWith('₹') ? product.price.slice(1) : product.price;
    this.desc = product.desc;
    this.code = product.code;
    this.selectedIcon = product.icon || '🏷️';
    
    if (product.images && product.images.length > 0) {
      this.imagePreviewUrls = [...product.images];
    } else if (product.image) {
      this.imagePreviewUrls = [product.image];
    } else {
      this.imagePreviewUrls = [];
    }
  }

  cancelEdit() {
    this.editingProductCode = null;
    this.resetForm();
  }

  resetForm() {
    this.name = '';
    this.size = '';
    this.price = '';
    this.desc = '';
    this.code = '';
    this.selectedIcon = '🏷️';
    this.imagePreviewUrls = [];
    this.subcategory = '';
    const fileInput = document.getElementById('p-image') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    
    if (this.categories.length > 0) {
      // Keep category selection or default to first
      if (!this.categories.some(c => c.name === this.category)) {
        this.category = this.categories[0].name;
      }
      this.onCategoryChange();
    }
  }

  deleteProduct(code: string) {
    if (confirm(`Are you sure you want to delete product "${code}"?`)) {
      this.products = this.products.filter(p => p.code !== code);
      this.saveToStorage();
      if (this.editingProductCode === code) {
        this.cancelEdit();
      }
    }
  }

  // Category Management Handlers
  addCategory() {
    const name = this.newCategoryName.trim();
    if (!name) return;
    if (this.categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      alert('Category already exists.');
      return;
    }
    this.categories.push({ name, subcategories: [] });
    this.saveCategoriesToStorage();
    this.newCategoryName = '';
    
    if (this.categories.length === 1) {
      this.category = name;
      this.onCategoryChange();
    }
  }

  deleteCategory(name: string) {
    if (confirm(`Are you sure you want to delete category "${name}"? This will not delete products under this category, but they won't belong to any active category.`)) {
      this.categories = this.categories.filter(c => c.name !== name);
      this.saveCategoriesToStorage();
      if (this.category === name) {
        if (this.categories.length > 0) {
          this.category = this.categories[0].name;
        } else {
          this.category = '';
        }
        this.onCategoryChange();
      }
    }
  }

  addSubcategory(categoryName: string) {
    const subName = (this.newSubcategoryNames[categoryName] || '').trim();
    if (!subName) return;

    const catObj = this.categories.find(c => c.name === categoryName);
    if (catObj) {
      if (catObj.subcategories.some(s => s.toLowerCase() === subName.toLowerCase())) {
        alert('Subcategory already exists in this category.');
        return;
      }
      catObj.subcategories.push(subName);
      this.saveCategoriesToStorage();
      this.newSubcategoryNames[categoryName] = '';
      if (this.category === categoryName) {
        this.onCategoryChange();
      }
    }
  }

  deleteSubcategory(categoryName: string, subName: string) {
    if (confirm(`Are you sure you want to delete subcategory "${subName}" from "${categoryName}"?`)) {
      const catObj = this.categories.find(c => c.name === categoryName);
      if (catObj) {
        catObj.subcategories = catObj.subcategories.filter(s => s !== subName);
        this.saveCategoriesToStorage();
        if (this.category === categoryName) {
          this.onCategoryChange();
        }
      }
    }
  }

  // CSV Import Logic
  onCSVFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;
    this.importFile = file;
    this.csvErrors = [];
    this.csvProducts = [];
    this.csvConflictCount = 0;
    this.csvNewCount = 0;
    this.csvSuccessMessage = '';
    this.csvErrorMessage = '';

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const text = e.target.result;
      this.processCSV(text);
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  }

  processCSV(text: string) {
    const parsedRows = this.parseCSV(text);
    if (parsedRows.length <= 1) {
      this.csvErrorMessage = 'CSV file is empty or only contains headers.';
      return;
    }

    const headers = parsedRows[0].map(h => h.trim().toLowerCase());
    const colIdx = {
      code: headers.indexOf('code'),
      name: headers.indexOf('name'),
      category: headers.indexOf('category'),
      subcategory: headers.indexOf('subcategory'),
      size: headers.indexOf('size'),
      price: headers.indexOf('price'),
      description: headers.indexOf('description'),
      icon: headers.indexOf('icon'),
      imageUrls: headers.indexOf('image_urls') !== -1 ? headers.indexOf('image_urls') : headers.indexOf('image_url')
    };

    if (colIdx.code === -1 || colIdx.name === -1 || colIdx.category === -1 || colIdx.price === -1 || colIdx.size === -1) {
      this.csvErrorMessage = 'Missing required column headers: Code, Name, Category, Price, and Size are required.';
      return;
    }

    const seenCodesInFile = new Set<string>();

    for (let i = 1; i < parsedRows.length; i++) {
      const row = parsedRows[i];
      if (row.length === 0 || (row.length === 1 && row[0].trim() === '')) {
        continue;
      }

      const rowNum = i + 1;

      // Extract values with bounds checks
      const rawCode = colIdx.code < row.length ? row[colIdx.code].trim() : '';
      const rawName = colIdx.name < row.length ? row[colIdx.name].trim() : '';
      const rawCategory = colIdx.category < row.length ? row[colIdx.category].trim() : '';
      const rawSubcategory = colIdx.subcategory !== -1 && colIdx.subcategory < row.length ? row[colIdx.subcategory].trim() : '';
      const rawSize = colIdx.size < row.length ? row[colIdx.size].trim() : '';
      const rawPrice = colIdx.price < row.length ? row[colIdx.price].trim() : '';
      const rawDesc = colIdx.description !== -1 && colIdx.description < row.length ? row[colIdx.description].trim() : '';
      const rawIcon = colIdx.icon !== -1 && colIdx.icon < row.length ? row[colIdx.icon].trim() : '🏷️';
      const rawImageUrls = colIdx.imageUrls !== -1 && colIdx.imageUrls < row.length ? row[colIdx.imageUrls].trim() : '';

      // Validation
      if (!rawCode) {
        this.csvErrors.push(`Row ${rowNum}: Code is required.`);
        continue;
      }
      if (!rawName) {
        this.csvErrors.push(`Row ${rowNum} (${rawCode}): Name is required.`);
        continue;
      }
      if (!rawCategory) {
        this.csvErrors.push(`Row ${rowNum} (${rawCode}): Category is required.`);
        continue;
      }
      if (!rawSize) {
        this.csvErrors.push(`Row ${rowNum} (${rawCode}): Size is required.`);
        continue;
      }
      if (!rawPrice) {
        this.csvErrors.push(`Row ${rowNum} (${rawCode}): Price is required.`);
        continue;
      }

      const formattedCode = rawCode.toUpperCase();

      if (seenCodesInFile.has(formattedCode)) {
        this.csvErrors.push(`Row ${rowNum} (${formattedCode}): Duplicate Code inside the CSV file.`);
        continue;
      }
      seenCodesInFile.add(formattedCode);

      let categoryName = rawCategory;
      let subcategoryName = rawSubcategory || undefined;

      // Automatically add category if it doesn't exist
      const catExists = this.categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
      if (!catExists) {
        this.categories.push({
          name: categoryName,
          subcategories: subcategoryName ? [subcategoryName] : []
        });
        this.saveCategoriesToStorage();
      } else if (subcategoryName) {
        const subExists = catExists.subcategories.some(s => s.toLowerCase() === subcategoryName!.toLowerCase());
        if (!subExists) {
          catExists.subcategories.push(subcategoryName);
          this.saveCategoriesToStorage();
        }
      }

      // Re-map to Correct casing from configurations
      const matchCat = this.categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
      if (matchCat) {
        categoryName = matchCat.name;
        if (subcategoryName) {
          const matchSub = matchCat.subcategories.find(s => s.toLowerCase() === subcategoryName!.toLowerCase());
          if (matchSub) subcategoryName = matchSub;
        }
      }

      // Handle Image URL CSV listing
      let imagesList: string[] | undefined = undefined;
      let primaryImage: string | undefined = undefined;
      if (rawImageUrls) {
        imagesList = rawImageUrls.split(',').map(url => url.trim()).filter(url => url !== '');
        if (imagesList.length > 0) {
          primaryImage = imagesList[0];
        }
      }

      const product: Product = {
        name: rawName,
        category: categoryName,
        subcategory: subcategoryName,
        size: rawSize,
        price: rawPrice.startsWith('₹') ? rawPrice : '₹' + rawPrice,
        desc: rawDesc,
        icon: rawIcon || '🏷️',
        image: primaryImage,
        images: imagesList,
        code: formattedCode
      };

      this.csvProducts.push(product);

      // Check duplicates count
      if (this.products.some(p => p.code === formattedCode)) {
        this.csvConflictCount++;
      } else {
        this.csvNewCount++;
      }
    }
  }

  commitImport() {
    if (this.csvProducts.length === 0) return;

    let addedCount = 0;
    let updatedCount = 0;

    for (const p of this.csvProducts) {
      const idx = this.products.findIndex(prod => prod.code === p.code);
      if (idx !== -1) {
        if (this.csvConflictAction === 'overwrite') {
          this.products[idx] = p;
          updatedCount++;
        }
      } else {
        this.products.unshift(p);
        addedCount++;
      }
    }

    this.saveToStorage();

    this.csvSuccessMessage = `✓ Successfully imported catalog data! Added: ${addedCount}, Overwritten/Updated: ${updatedCount}.`;
    this.csvProducts = [];
    this.csvErrors = [];
    this.importFile = null;
    this.csvConflictCount = 0;
    this.csvNewCount = 0;

    setTimeout(() => (this.csvSuccessMessage = ''), 5000);
  }

  cancelImport() {
    this.csvProducts = [];
    this.csvErrors = [];
    this.importFile = null;
    this.csvConflictCount = 0;
    this.csvNewCount = 0;
    this.csvSuccessMessage = '';
    this.csvErrorMessage = '';
  }

  downloadCSVTemplate() {
    const headers = 'Code,Name,Category,Subcategory,Size,Price,Description,Icon,Image_URLs\r\n';
    const sampleRow1 = 'JZZ4501,Acrylic Golden Name Plate,Name Plates,Acrylic,15x24 Inch,1800,Premium acrylic base with metallic golden letters.,🏷️,https://images.unsplash.com/photo-1513519245088-0e12902e5a38\r\n';
    const sampleRow2 = 'FZZ-2,LED Mirror Photo Frame,LED & Photo Frames,Magic Mirrors,12x18 Inch,999,Magic mirror with LED lights showing custom photo.,🪞,\r\n';
    
    const blob = new Blob([headers + sampleRow1 + sampleRow2], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'spiritual_imagination_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // RFC 4180 compliant CSV parser
  parseCSV(text: string): string[][] {
    const lines: string[][] = [];
    let row: string[] = [''];
    let insideQuote = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (insideQuote && nextChar === '"') {
          // Escaped quote
          row[row.length - 1] += '"';
          i++;
        } else {
          // Toggle quote state
          insideQuote = !insideQuote;
        }
      } else if (char === ',' && !insideQuote) {
        row.push('');
      } else if ((char === '\r' || char === '\n') && !insideQuote) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        lines.push(row);
        row = [''];
      } else {
        row[row.length - 1] += char;
      }
    }
    if (row.length > 1 || row[0] !== '') {
      lines.push(row);
    }
    return lines;
  }
}
