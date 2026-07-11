import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService, Product, Category, Order, FeaturedSlide } from '../../core/services/supabase.service';
import { AssetUrlPipe } from '../../core/pipes/asset-url.pipe';

@Component({
  selector: 'app-admin-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, AssetUrlPipe],
  templateUrl: './admin-upload.component.html',
  styleUrls: ['./admin-upload.component.css']
})
export class AdminUploadComponent implements OnInit {
  activeTab: 'products' | 'categories' | 'orders' | 'slides' | 'manage' = 'products';

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
  featured = false;

  // Banner Slide Model
  slideTitle = '';
  slideCategory = '';
  slideDescription = '';
  slidePrice = '';
  slideProductCode = '';
  slideImagePreviewUrl = '';
  slides: FeaturedSlide[] = [];

  // Edit State
  editingProductCode: string | null = null;

  // ---- MANAGE TAB STATE ----
  manageSearch = '';
  manageCategory = 'All';
  selectedCodes = new Set<string>();
  showEditModal = false;
  // modal form fields (reuse main form fields when editing from manage tab)

  get filteredManagedProducts(): Product[] {
    const q = this.manageSearch.trim().toLowerCase();
    return this.products.filter(p => {
      const matchCat = this.manageCategory === 'All' || p.category === this.manageCategory;
      const matchQ = !q ||
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.desc || '').toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }

  get allSelected(): boolean {
    const fp = this.filteredManagedProducts;
    return fp.length > 0 && fp.every(p => this.selectedCodes.has(p.code));
  }

  toggleSelectAll() {
    if (this.allSelected) {
      this.filteredManagedProducts.forEach(p => this.selectedCodes.delete(p.code));
    } else {
      this.filteredManagedProducts.forEach(p => this.selectedCodes.add(p.code));
    }
  }

  toggleSelectOne(code: string) {
    if (this.selectedCodes.has(code)) {
      this.selectedCodes.delete(code);
    } else {
      this.selectedCodes.add(code);
    }
  }

  async bulkDelete() {
    const count = this.selectedCodes.size;
    if (count === 0) return;
    if (!confirm(`Delete ${count} selected product(s)? This cannot be undone.`)) return;

    const codes = [...this.selectedCodes];
    try {
      for (const code of codes) {
        await this.supabaseService.deleteProduct(code);
      }
      this.selectedCodes.clear();
      this.loadProducts();
      this.successMessage = `✓ Deleted ${count} product(s) successfully!`;
      setTimeout(() => (this.successMessage = ''), 3500);
    } catch (err: any) {
      this.errorMessage = err.message || 'Error during bulk delete.';
      setTimeout(() => (this.errorMessage = ''), 3500);
    }
  }

  openEditModal(product: Product) {
    this.editProduct(product);
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.cancelEdit();
  }

  saveEditModal() {
    this.onSubmit();
    // onSubmit resets editingProductCode on success which we watch
    // close modal after slight delay to allow success message
    setTimeout(() => {
      if (!this.editingProductCode) {
        this.showEditModal = false;
      }
    }, 400);
  }

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

  constructor(
    private supabaseService: SupabaseService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
    this.loadOrders();
    this.loadFeaturedSlides();
  }

  loadCategories() {
    this.supabaseService.getCategories().then(data => {
      this.categories = data;
      if (this.categories.length > 0) {
        // Keep selection if still valid, otherwise default to first category
        if (!this.category || !this.categories.some(c => c.name === this.category)) {
          this.category = this.categories[0].name;
        }
        this.onCategoryChange();
      }
    }).catch(err => {
      console.error('Error loading categories from Supabase', err);
    });
  }

  onCategoryChange() {
    const catObj = this.categories.find(c => c.name === this.category);
    this.subcategories = catObj ? catObj.subcategories : [];
    this.subcategory = this.subcategories.length > 0 ? this.subcategories[0] : '';
  }

  loadProducts() {
    this.supabaseService.getProducts().then(data => {
      this.products = data;
    }).catch(err => {
      console.error('Error loading products from Supabase', err);
    });
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
      images: this.imagePreviewUrls.length > 0 ? this.imagePreviewUrls : undefined,
      featured: this.featured
    };

    const isEdit = !!this.editingProductCode;
    
    // Save directly to Supabase
    this.supabaseService.saveProduct(productData).then(() => {
      this.loadProducts();
      this.resetForm();
      this.errorMessage = '';
      this.editingProductCode = null;
      this.successMessage = isEdit ? '✓ Product updated successfully!' : '✓ Product uploaded successfully!';
      setTimeout(() => (this.successMessage = ''), 3500);
    }).catch(err => {
      this.errorMessage = err.message || 'Error listing product to database.';
    });
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
    this.featured = product.featured || false;
    
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
    this.featured = false;
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
      this.supabaseService.deleteProduct(code).then(() => {
        this.loadProducts();
        if (this.editingProductCode === code) {
          this.cancelEdit();
        }
      }).catch(err => {
        alert('Error deleting product: ' + err.message);
      });
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
    
    const newCat: Category = { name, subcategories: [] };
    this.supabaseService.upsertCategory(newCat).then(() => {
      this.loadCategories();
      this.newCategoryName = '';
    }).catch(err => {
      alert('Error adding category: ' + err.message);
    });
  }

  deleteCategory(name: string) {
    if (confirm(`Are you sure you want to delete category "${name}"? This will not delete products under this category, but they won't belong to any active category.`)) {
      this.supabaseService.deleteCategory(name).then(() => {
        this.loadCategories();
      }).catch(err => {
        alert('Error deleting category: ' + err.message);
      });
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
      
      const updatedCat: Category = {
        name: catObj.name,
        subcategories: [...catObj.subcategories, subName]
      };

      this.supabaseService.upsertCategory(updatedCat).then(() => {
        this.newSubcategoryNames[categoryName] = '';
        this.loadCategories();
      }).catch(err => {
        alert('Error adding subcategory: ' + err.message);
      });
    }
  }

  deleteSubcategory(categoryName: string, subName: string) {
    if (confirm(`Are you sure you want to delete subcategory "${subName}" from "${categoryName}"?`)) {
      const catObj = this.categories.find(c => c.name === categoryName);
      if (catObj) {
        const updatedCat: Category = {
          name: catObj.name,
          subcategories: catObj.subcategories.filter(s => s !== subName)
        };

        this.supabaseService.upsertCategory(updatedCat).then(() => {
          this.loadCategories();
        }).catch(err => {
          alert('Error deleting subcategory: ' + err.message);
        });
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

  async processCSV(text: string) {
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

      // Automatically add category if it doesn't exist in Supabase
      let catExists = this.categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
      if (!catExists) {
        const newCat: Category = { name: categoryName, subcategories: subcategoryName ? [subcategoryName] : [] };
        try {
          await this.supabaseService.upsertCategory(newCat);
          this.categories.push(newCat);
          catExists = newCat;
        } catch (e) {
          this.csvErrors.push(`Row ${rowNum}: Failed to register category "${categoryName}".`);
        }
      } else if (subcategoryName) {
        const subExists = catExists.subcategories.some(s => s.toLowerCase() === subcategoryName!.toLowerCase());
        if (!subExists) {
          catExists.subcategories.push(subcategoryName);
          try {
            await this.supabaseService.upsertCategory(catExists);
          } catch (e) {
            this.csvErrors.push(`Row ${rowNum}: Failed to append subcategory "${subcategoryName}" to "${categoryName}".`);
          }
        }
      }

      // Re-map to correct casing from configurations
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
      if (rawImageUrls) {
        imagesList = rawImageUrls.split(',').map(url => url.trim()).filter(url => url !== '');
      }

      const product: Product = {
        name: rawName,
        category: categoryName,
        subcategory: subcategoryName,
        size: rawSize,
        price: rawPrice.startsWith('₹') ? rawPrice : '₹' + rawPrice,
        desc: rawDesc,
        icon: rawIcon || '🏷️',
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

  async commitImport() {
    if (this.csvProducts.length === 0) return;

    let addedCount = 0;
    let updatedCount = 0;

    try {
      for (const p of this.csvProducts) {
        const exists = this.products.some(prod => prod.code === p.code);
        if (exists) {
          if (this.csvConflictAction === 'overwrite') {
            await this.supabaseService.saveProduct(p);
            updatedCount++;
          }
        } else {
          await this.supabaseService.saveProduct(p);
          addedCount++;
        }
      }

      this.loadProducts();
      this.loadCategories();

      this.csvSuccessMessage = `✓ Successfully imported catalog data! Added: ${addedCount}, Overwritten/Updated: ${updatedCount}.`;
      this.csvProducts = [];
      this.csvErrors = [];
      this.importFile = null;
      this.csvConflictCount = 0;
      this.csvNewCount = 0;
    } catch (err: any) {
      this.csvErrorMessage = 'Import aborted: ' + (err.message || 'Database error occurred.');
    }

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

  // --- FEATURED TOGGLE ---
  toggleFeatured(product: Product) {
    const nextFeatured = !product.featured;
    this.supabaseService.toggleProductFeatured(product.code, nextFeatured).then(() => {
      product.featured = nextFeatured;
      this.successMessage = `✓ Updated featured state for ${product.name}!`;
      setTimeout(() => (this.successMessage = ''), 2500);
      this.loadProducts();
    }).catch(err => {
      this.errorMessage = err.message || 'Error toggling featured state.';
      setTimeout(() => (this.errorMessage = ''), 3500);
    });
  }

  // --- ORDERS MANAGEMENT ---
  orders: Order[] = [];
  orderStatusMessage = '';

  loadOrders() {
    this.supabaseService.getOrders().then(data => {
      this.orders = data;
    }).catch(err => {
      console.error('Error loading orders from Supabase', err);
    });
  }

  updateStatus(orderId: string, event: any) {
    const status = event.target.value;
    this.supabaseService.updateOrderStatus(orderId, status).then(() => {
      this.orderStatusMessage = '✓ Order status updated successfully!';
      setTimeout(() => (this.orderStatusMessage = ''), 2500);
      this.loadOrders();
    }).catch(err => {
      console.error('Error updating order status', err);
      this.errorMessage = err.message || 'Failed to update order status.';
      setTimeout(() => (this.errorMessage = ''), 3500);
    });
  }

  // --- FEATURED BANNER SLIDES MANAGEMENT ---
  loadFeaturedSlides() {
    this.supabaseService.getFeaturedSlides().then(data => {
      this.slides = data;
    }).catch(err => {
      console.error('Error loading featured slides', err);
    });
  }

  onSlideImageSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      this.errorMessage = 'Banner image exceeds 3MB limit.';
      setTimeout(() => (this.errorMessage = ''), 3500);
      return;
    }

    this.compressBannerImage(file).then(base64 => {
      this.slideImagePreviewUrl = base64;
    }).catch(err => {
      console.error('Error compressing banner image', err);
      this.errorMessage = 'Failed to process banner image.';
      setTimeout(() => (this.errorMessage = ''), 3500);
    });
  }

  compressBannerImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
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
            resolve(canvas.toDataURL('image/jpeg', 0.8));
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

  onSubmitSlide() {
    if (!this.slideTitle || !this.slideProductCode || !this.slideImagePreviewUrl) {
      this.errorMessage = 'Slide Title, Product Code, and Banner Image are required.';
      setTimeout(() => (this.errorMessage = ''), 3500);
      return;
    }

    const slideData = {
      title: this.slideTitle.trim(),
      category: this.slideCategory.trim() || undefined,
      description: this.slideDescription.trim() || undefined,
      price: this.slidePrice.trim() || undefined,
      product_code: this.slideProductCode.trim().toUpperCase(),
      image_url: this.slideImagePreviewUrl
    };

    this.supabaseService.saveFeaturedSlide(slideData).then(() => {
      this.successMessage = '✓ Homepage banner slide saved successfully!';
      setTimeout(() => (this.successMessage = ''), 3500);
      this.clearSlideForm();
      this.loadFeaturedSlides();
    }).catch(err => {
      this.errorMessage = err.message || 'Error saving featured slide.';
      setTimeout(() => (this.errorMessage = ''), 3500);
    });
  }

  deleteSlide(id: string) {
    if (!confirm('Are you sure you want to delete this homepage banner slide?')) return;

    this.supabaseService.deleteFeaturedSlide(id).then(() => {
      this.successMessage = '✓ Banner slide deleted successfully!';
      setTimeout(() => (this.successMessage = ''), 3500);
      this.loadFeaturedSlides();
    }).catch(err => {
      this.errorMessage = err.message || 'Error deleting banner slide.';
      setTimeout(() => (this.errorMessage = ''), 3500);
    });
  }

  clearSlideForm() {
    this.slideTitle = '';
    this.slideCategory = '';
    this.slideDescription = '';
    this.slidePrice = '';
    this.slideProductCode = '';
    this.slideImagePreviewUrl = '';
    const fileInput = document.getElementById('slide-image') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }
}
