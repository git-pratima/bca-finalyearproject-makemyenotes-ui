export interface feedbackModel {
      id?:string;
      rating?:number;
      message?:string;
  };


export interface CategorySearch  {
      category: '',
      subCategory: '',
      topic: '',
      active: ''
}

export interface CategoryAddForm {
  category: string;
  subCategory: string;
  topic: string;
  active: string;
}

export interface Category {
  id: number;
  category: string;
  subCategory: string;
  topic: string;
  active:string;
}
