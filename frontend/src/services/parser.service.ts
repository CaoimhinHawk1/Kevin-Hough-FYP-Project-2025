// services/pdf-parser.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PdfParserService {
  private apiUrl = 'http://localhost:3000/api/parse-pdf';

  constructor(private http: HttpClient) { }

  parsePdf(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('pdf', file);
    return this.http.post(this.apiUrl, formData);
  }
}
