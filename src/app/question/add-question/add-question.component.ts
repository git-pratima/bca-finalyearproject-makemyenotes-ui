import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../service/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../category/service/category.service';
import { QuestionService } from '../service/question.service';
import { NotificationService } from '../../shared/notificationService';

@Component({
  selector: 'app-add-question',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-question.component.html',
  styleUrl: './add-question.component.css'
})
export class AddQuestionComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService,
    private questionService: QuestionService,
    private notify: NotificationService
  ){}

  qId: string | null = null
  category:string = '';
  subCategory:string='';
  topic:string='';
  type:string='';
  question:string='';
  bookmark:string='';
  level:string='';
  answer:string='';
  imageUrl:string='';
  imageFile:File | null = null;
  categories:any[] = [];
  message:string = '';
  categoryList: String[] = [];
  subCategoryList:string[] = [];
  topicList:string[] = [];





  ngOnInit(): void {
    this.loadDropDown();
    this.qId = this.route.snapshot.paramMap.get('productId');
  }


  //GET ALL CATEGORIES
  loadDropDown():void{
    this.categoryService.getCategoryList().subscribe({
      next: (res)=>{
        this.categoryList = res.categoryList;
      },error:(err)=>console.error(err)
    });
  }


  //GET CATEGORY BY ID

  fetchProductById(productId: string):void{
    this.questionService.getQuestionById(productId).subscribe({
      next:(res:any) =>{
        if (res.status === 200) {
          const product = res.product;
          this.category = product.category;
          this.imageUrl = product.imageUrl;
        }else{
          this.notify.error(res.message);
        }
      },
      error:(error) =>{
        this.notify.error(error?.error?.message || error?.message || "Unable to get all categories" + error);
      }})
  }

  handleImageChange(event: Event):void{
    const input = event.target as HTMLInputElement;
    if (input?.files?.[0]) {
      this.imageFile = input.files[0]
      const reader = new FileReader();
      reader.onloadend = () =>{
        this.imageUrl = reader.result as string
      }
      reader.readAsDataURL(this.imageFile);
    }
  }

  handleSubmit(event : Event):void{
    event.preventDefault()
    const formData = new FormData();
    formData.append("category", this.category);
    formData.append("topic", this.topic);
    formData.append("type", this.type);
    formData.append("bookmark", this.bookmark);
    formData.append("level", this.level);
    formData.append("question", this.question);
    formData.append("answer", this.answer);
    formData.append("subCategory", this.subCategory);
    formData.forEach((value, key) => {
      console.log(key, value);
    });
    if (this.imageFile) {
      formData.append("imageFile", this.imageFile);
    }   
    
    this.questionService.addQuestion(formData).subscribe({
        next:(res:any) =>{

          if (res.status === 200) {
            this.notify.success("Question Saved successfully.");
            this.router.navigate(['/all-question'])
          }
        },
        error:(error) =>{
          this.notify.success(error?.error?.message || error?.message || "Unable to save a Question" + error);
        }})
   }

  onChangeCategory(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const category1 = selectElement.value;
    this.categoryService.getSubCategoryList(category1).subscribe({
      next: (res)=>{
        this.subCategoryList = res.subCategoryList;
        console.log(this.subCategoryList);
      },error:(err)=>this.notify.success(err.error.message)
    });
  }

  onChangeSubCategory(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const subCat = selectElement.value;
    this.categoryService.getTopicList(subCat).subscribe({
      next: (res)=>{
        this.topicList = res.topicList;
      },error:(err)=>this.notify.success(err.error.message)
    });
  }
}