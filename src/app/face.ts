import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-face-database',
  templateUrl: './face-database.component.html',
  styleUrls: ['./face-database.component.css']
})
export class FaceDatabaseComponent {
  // 定义请求参数类型
  params: {
    page?: number,
    limit?: number,
    name?: string,
    group?: string
  } = {};

  // 定义响应数据类型
  responseData: {
    code: number,
    msg: string,
    data: {
      total: number,
      per_page: number,
      current_page: number,
      last_page: number,
      data: {
        id: number,
        name: string,
        group: string,
        created_time: string,
        updated_time: string,
        is_deleted: boolean,
        face_base64: string
      }[]
    }
  };

  constructor(private http: HttpClient) { }

  search() {
    // 构造请求URL
    let url = '/api/face_database';
    if (this.params.page) {
      url += `?page=${this.params.page}`;
    }
    if (this.params.limit) {
      url += `&limit=${this.params.limit}`;
    }
    if (this.params.name) {
      url += `&name=${this.params.name}`;
    }
    if (this.params.group) {
      url += `&group=${this.params.group}`;
    }

    // 发送GET请求获取响应数据
    this.http.get(url).subscribe((data: any) => {
      this.responseData = data;
    });
  }

  getPages() {
    // 计算分页按钮的数量
    let start = Math.max(1, this.responseData.data.current_page - 2);
    let end = Math.min(this.responseData.data.last_page, start + 4);
    start = Math.max(1, end - 4);

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }
}
