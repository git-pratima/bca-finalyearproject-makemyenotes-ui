import { HttpClient } from '@angular/common/http';
import { Component, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryService } from '../service/category.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseComponent } from '../../shared/baseComponent';
import { Category } from '../../shared/app.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css'
})
export class CategoryListComponent extends BaseComponent implements OnInit {

  searchForm = {
    category: '',
    topic:'',
    active: '',
    subCategory:''
  };
  categoryList: String[] = [];
  subCategoryList: String[] = [];
  topicList: String[] = [];
  categories: Category[] = []
  totalPages = 0;
  totalElements = 0;
  page = 0;
  size = 10;
  sortBy = 'id';
  direction = 'asc';

  constructor(injector:Injector, private categoryService:CategoryService){
    super(injector);
  }

  ngOnInit(): void {
    this.loadDropdown();
    this.loadCategories();
  }

  resetSearch(): void {
    this.searchForm = {
      category: '',
      active: '',
      subCategory:'',
      topic:''
    };
    this.page = 0; // reset to first page
    this.loadCategories(); // reload full list
}


  loadDropdown():void{
    this.categoryService.getCategoryList().subscribe({
      next: (res)=>{
        this.categoryList = res.categoryList;
        console.log(this.categoryList);
      },error:(err)=>console.error(err)
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategory(this.page,this.size,this.direction,this.sortBy,this.searchForm).subscribe({
      next: (res) => {
        this.categories = res.categories;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
      },
      error: (err) => console.error(err)
    });
  }

  changePage(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.page = newPage;
      this.loadCategories();
    }
  }

  changeSize(event: any): void {
    this.size = event.target.value;
    this.page = 0;
    this.loadCategories();
  }

  sort(column: string): void {
    if (this.sortBy === column) {
      this.direction = this.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.direction = 'asc';
    }
    this.loadCategories();
  }

  addCategory(): void {
    this.router.navigate(['/add-category']);
  }

  viewCategory(id: number): void {
    this.router.navigate(['/view-category', id]);
  }

  updateCategory(id: number): void {
    this.router.navigate(['/update-category', id]);
  }

  deleteCategory(id: number): void {
      if (!confirm("Are you sure you want to delete this Reference Code?")) {
        return ;
      }

      this.categoryService.deleteCategory(id).subscribe({
          next: (res:any) => {
                alert('Category Deleted Sucessfully!');
                window.location.reload();
              },
              error: (err: any) => {
              if(err.error.status===401){
                alert('Need Access/Login!');
                this.router.navigate(['/login']);
              }
              alert(err.error.message);
            }
    });
  }

  onCategoryChange(event: Event):void{
    const selectElement = event.target as HTMLSelectElement;
    const category = selectElement.value;
    this.categoryService.getSubCategoryList(category).subscribe({
      next: (res)=>{
        this.subCategoryList = res.subCategoryList;
         this.searchForm.subCategory='';
         this.searchForm.topic='';
        this.search();
      },error:(err)=>{
        this.notify.error(err.error.message);
      }
    });
  }

  onSubCategoryChange(event: Event):void{
    const selectElement = event.target as HTMLSelectElement;
    const subCat = selectElement.value;
    this.categoryService.getTopicList(subCat).subscribe({
      next: (res)=>{
        this.topicList = res.topicList;
        this.searchForm.topic='';
        this.search();
      },error:(err)=>console.error(err)
    });
  }

  ontopicChange(event: Event):void{
    this.search();
  }

  // Search method
  search(): void {
    this.page = 0; // reset to first page
    this.loadCategories(); // reload with filters applied
  }


}

