
import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import { ViewChild, ElementRef } from '@angular/core';
interface ResponseData {
  code: number;
  data: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    data: any[];
  };
  message: string;
}

@Component({
  selector: 'app-face',
  templateUrl: './face.component.html',
  styleUrls: ['./face.component.css']
})

export class FaceComponent implements OnInit {
  dataList: any[] = [];
  total: number = 0;
  page: number = 0;
  perPage: number = 10;
  currentPage: number = 1;
  lastPage: number = 0;
  searchName: string = '';
  searchGroup: string = '';
  name: string = '';
  group: string = '';
  faceId: string = '';
  
  response: ResponseData = { code: 0, data: { total: 0, per_page: 0, current_page: 0, last_page: 0, data: [] }, message: '' };

  constructor() { }

  ngOnInit(): void {
    this.response = { code: 0, data: { total: 0, per_page: 0, current_page: 0, last_page: 0, data: [] }, message: '' };
    this.loadPage(1);
  }

  async loadPage(page: number = 1) {
    try {
      console.log('name:', this.name, 'group:', this.group, 'file:', this.file);
      const response = await axios.get('http://localhost:5000/api/face_database', {
        params: {
          page:(page).toString(),
          limit: this.perPage.toString(),
          name: this.searchName,
          group: this.searchGroup
        }
      });
      this.response = response.data;
      if (this.response.code === 0) {
        this.total = this.response.data.total;
        this.perPage = this.response.data.per_page;
        this.currentPage = this.response.data.current_page;
        this.lastPage = this.response.data.last_page;
        this.dataList = this.response.data.data;
      } else {
        alert('获取数据失败');
      }
    } catch (error) {
      console.error(error);
      alert('获取数据失败');
    }
  }

  search() {
    this.loadPage(1);
  }

  resetSearch() {
    this.searchName = '';
    this.searchGroup = '';
    this.loadPage(1);
  }

  onPageChanged(event: any) {
    this.loadPage(event.page);
  }

  getPages(): number[] {
    const pages: number[] = [];
    const currentPage = this.currentPage;
    const lastPage = this.lastPage;
    const delta = 2;
  
    // add the first page
    pages.push(1);
  
    // calculate the range of pages to display
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(lastPage - 1, currentPage + delta); i++) {
      pages.push(i);
    }
  
    // add the last page
    if (lastPage > 1) {
      pages.push(lastPage);
    }
  
    return pages;
  }
  onNextPageClicked(event: Event) {
    event.preventDefault();
    const nextPage = this.currentPage + 1;
    if (nextPage <= this.lastPage) {
      this.loadPage(nextPage);
    }
  }
  
  onPrePageClicked(event: Event) {
    event.preventDefault();
    const nextPage = this.currentPage - 1;
    if (nextPage <= this.lastPage) {
      this.loadPage(nextPage);
    }
  }

  getImageUrl(base64Img: string): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = 'data:image/png;base64,' + base64Img;
    canvas.width = 60;
    canvas.height = 60;
    ctx!.drawImage(img, 0, 0, 60, 60);
    return canvas.toDataURL();
  }

  getThumbnail(imageData: string): string {
    const image = new Image();
    image.src = 'data:image/png;base64,' + imageData;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const thumbnailWidth = 100;
    const thumbnailHeight = thumbnailWidth * image.height / image.width;
    canvas.width = thumbnailWidth;
    canvas.height = thumbnailHeight;
    ctx!.drawImage(image, 0, 0, thumbnailWidth, thumbnailHeight);
    return canvas.toDataURL();
  }
  
  showImage(imageData: string): void {
    const image = new Image();
    image.src = imageData;
    const width = window.innerWidth * 0.8;
    const height = width * image.height / image.width;
    const imageUrl = image.src;
    const html = `<div class="modal"><div class="modal-content"><img src="${imageUrl}" width="${width}" height="${height}"></div></div>`;
    const div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div);
  }

  // 定义添加人脸相关的属性
  showAddFace = false;

  file: File | null = null;
  // 定义添加人脸成功弹窗相关的属性
  showAddFaceSuccess = false;

  // 打开添加人脸弹窗
  showAddFaceModal() {
    this.showAddFace = true;
  }

  // 关闭添加人脸弹窗
  cancelAddFace() {
    this.showAddFace = false;
    this.name = '';
    this.group = '';
    this.file = null;
  }

  // 选择文件后触发
  onFileChange(event: any) {
    this.file = event.target.files[0];
  }

  // 添加人脸
  async addFace() {
    if (!this.name || !this.group || !this.file) {
      alert('请填写完整信息');
      return;
    }
    // 将文件转换为 base64
    const reader = new FileReader();
    reader.readAsDataURL(this.file);
    reader.onload = async () => {
      const base64Img = reader.result!.toString().split(',')[1];
      // 调用添加人脸接口
      try {
        const response = await axios.post('http://127.0.0.1:5000/add_face', {
          name: this.name,
          group: this.group,
          image: base64Img
        });
        if (response.data.success === true) {
          this.showAddFace = false;
          this.showAddFaceSuccess = true;
        } else {
          alert('添加失败');
        }
      } catch (error) {
        console.error(error);
        alert('添加失败');
      }
    };
  }

  // 关闭添加人脸成功弹窗
  hideAddFaceSuccess() {
    this.showAddFaceSuccess = false;
    this.loadPage(1);
  }

  updateId: number = 0;
  updateName: string = '';
  updateGroup: string = '';
  updateImageBase64: string = '';
  showModal = false;

  handleImageUpload($event: any) {
    const file = $event.target.files[0];
    const reader = new FileReader();
    reader.onload = (event: any) => {
      this.updateImageBase64 = event.target.result.toString().split(',')[1];
    };
    reader.readAsDataURL(file);
  }

  // 打开模态框
  openModal(face: any) {
    this.updateId = face.id;
    // this.updateName = face.name;
    // this.updateGroup = face.group;
    this.updateImageBase64 = '';
    this.showModal = true;
  }

  // 关闭模态框
  closeModal() {
    this.showModal = false;
    this.updateName = '';
    this.updateGroup = '';
    // this.updateImage = null;
  }


  async updateFace() {
    try {
      const response = await axios.put(`http://localhost:5000/api/face_database/${this.updateId}`, {
        name: this.name,
        group: this.group,
        face_base64: this.updateImageBase64
      });
      this.showModal = false;
      if (response.data.code === 0) {
        alert('修改成功');
        this.loadPage(this.currentPage);
      } else {
        alert('修改失败');
      }
    } catch (error) {
      console.error(error);
      alert('修改失败');
    }
  }

  async deleteFace(id: number) {
    if (confirm('确定删除这条记录吗？')) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/face_database/${id}`);
        if (response.data.success === true) {
          alert('删除成功');
          this.loadPage();
        } else {
          alert('删除失败');
        }
      } catch (error) {
        console.error(error);
        alert('删除失败');
      }
    }
  }
}