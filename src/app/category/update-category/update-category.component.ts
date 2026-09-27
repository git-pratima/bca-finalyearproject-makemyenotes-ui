import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../service/category.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BaseComponent } from '../../shared/baseComponent';

@Component({
  selector: 'app-update-category',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule, CommonModule],
  templateUrl: './update-category.component.html',
  styleUrl: './update-category.component.css'
})
export class UpdateCategoryComponent extends BaseComponent implements OnInit{
  categoryId!: string;

    constructor(injector:Injector, private categoryService:CategoryService){
      super(injector);
    }
    formData: any = {
      id:'',
      category: '',
      active: '',
      topic:'',
      subCategory:''
  };
  
  message:string | null = null;
  categoryList: String[] = [];
  subCategoryList: String[] = [];
  topicList: String[] = [];

  isNewCat:boolean=false;
  isNewSubCat:boolean=false;
  isNewTopic:boolean=false;



  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('catId') || '';
    this.loadDropdown();
    this.loadCategoryData(this.categoryId);
  }

    addSubCatInExistingCat():void{
      this.isNewSubCat = !this.isNewSubCat;
      this.isNewTopic = this.isNewSubCat;
  }

  addTopicInExistingSubCat():void{
      this.isNewTopic = !this.isNewTopic;
  }

  addNewRefCodeInExistingCat():void{
    this.isNewCat = !this.isNewCat;
  }

  loadDropdown():void{
    this.categoryService.getCategoryList().subscribe({
      next: (res)=>{
        this.categoryList = res.categoryList;
        console.log(this.categoryList);
      },error:(err)=>console.error(err)
    });
  }

  loadCategoryData(categoryId: string) {
        this.categoryService.getCategoryById(this.categoryId).subscribe({
          next: (res:any) => {
                this.formData = {
                  id: res.category.id,
                  refCode: res.category.refCode,
                  refCodeLongName: res.category.refCodeLongName,
                  category: res.category.category,
                  active: res.category.active,
                  subCategory: res.category.subCategory
                };
                this.loadSubcategory(res.category.category, res.category.subCategory);
                this.loadTopic(res.category.subCategory, res.category.topic);
              },
              error: (err: any) => {
              if(err.error.status==401){
                alert('Need Access/Login!');
                this.router.navigate(['/login']);
            }
              alert(err.error.message);
        }
    });

  }

  handleSubmit() { 
    if( 
      !this.formData.category ||
      !this.formData.topic ||
      !this.formData.active ||
      !this.formData.subCategory
    ){
      this.notify.error("All fields are required");
      return;
    }
    console.log('Update: '+this.formData.subCategory);
    this.categoryService.updateCategory(this.formData).subscribe({
          next: (res:any) => {
                alert('Category Updated Sucessfully!');
                this.router.navigate(['/all-category']);
              },
              error: (err: any) => {
              if(err.error.status==401){
                alert('Need Access/Login!');
                this.router.navigate(['/login']);
              }
              alert(err.error.message);
            }
    });
  }

  loadSubcategory(cat:string, subCategory:string):void{
      this.categoryService.getSubCategoryList(cat).subscribe({
        next: (res)=>{
          this.subCategoryList = res.subCategoryList;

        },error:(err)=>console.error(err)
      });
      this.formData.subCategory = subCategory;
  }

  loadTopic(subCategory:string, topic:string):void{
      this.categoryService.getTopicList(subCategory).subscribe({
        next: (res)=>{
          this.topicList = res.topicList;
          
        },error:(err)=>console.error(err)
      });
      this.formData.topic = topic;
  }

  onChangeCategory(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const category = selectElement.value;
    this.categoryService.getSubCategoryList(category).subscribe({
      next: (res)=>{
        this.subCategoryList = res.subCategoryList;
      },error:(err)=>console.error(err)
    });
  }

 onChangeSubCategory(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const category = selectElement.value;
    this.categoryService.getTopicList(category).subscribe({
      next: (res)=>{
        this.topicList = res.topicList;
      },error:(err)=>console.error(err)
    });
  }

}
