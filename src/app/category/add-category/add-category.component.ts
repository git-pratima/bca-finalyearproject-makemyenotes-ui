import { Component, Injector, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../service/category.service';
import { BaseComponent } from '../../shared/baseComponent';
import { CategoryAddForm, CategorySearch } from '../../shared/app.model';

@Component({
  selector: 'app-add-category',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule, CommonModule],
  templateUrl: './add-category.component.html',
  styleUrl: './add-category.component.css'
})
export class AddCategoryComponent extends BaseComponent implements OnInit{

  constructor(injector: Injector, private categoryService: CategoryService) {
    super(injector); // ✅ NOW VALID
  }

  formData: CategoryAddForm = {
    category: '',
    subCategory: '',
    topic: '',
    active: 'Yes'
  };
  
  message:string | null = null;
  categoryList: String[] = [];
  subCategoryList: String[] = [];
  topicList: String[] = [];
  isNewCat:boolean=false;
  isNewSubCat:boolean=false;
  isNewTopic:boolean=false;

  ngOnInit(): void {
    this.loadDropdown();
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

  handleSubmit() { 
    if( 
      !this.formData?.category || 
      !this.formData?.subCategory || 
      !this.formData.topic || 
      !this.formData.active
    ){
      this.notify.error("All fields are required.");
      return;
    }
    this.categoryService.createCategory(this.formData).subscribe({
          next: (res:any) => {
                this.notify.success('Category Added Sucessfully!');
                this.router.navigate(['/all-category']);
              },
              error: (err: any) => {
                  if(err.error.status===401){
                    this.notify.error('Need Access/Login!');
                    this.router.navigate(['/login']);
                  }
                  this.notify.info(err.error.message);
              }
      });
  }
    
  onChangeCategory(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const category = selectElement.value;
    this.categoryService.getSubCategoryList(category).subscribe({
      next: (res)=>{
        this.subCategoryList = res.subCategoryList;
      },error:(err)=>{
        this.notify.error(err.error.message);
      }
    });
  }

  onChangeSubCategory(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const subCat = selectElement.value;
    this.categoryService.getTopicList(subCat).subscribe({
      next: (res)=>{
        this.topicList = res.topicList;
      },error:(err)=>console.error(err)
    });
  }    
}
