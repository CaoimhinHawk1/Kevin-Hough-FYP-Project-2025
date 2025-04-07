// components/pdf-parser/pdf-parser.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {PDFSource, PdfViewerModule} from 'ng2-pdf-viewer';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { PdfParserService } from '../../../services/parser.service';

@Component({
  selector: 'app-parser',
  templateUrl: './parser.component.html',
  styleUrls: ['./parser.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, PdfViewerModule, FilterPipe],
})
export class PdfParserComponent {
  extractedRequirements: any[] = [];
  isLoading = false;
  errorMessage = '';
  pdfPreviewUrl: string | Uint8Array | PDFSource | undefined = undefined;
  showOnlyCritical = false;


  constructor(private pdfParserService: PdfParserService) {}

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    // Preview PDF
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      if (arrayBuffer instanceof ArrayBuffer) {
        this.pdfPreviewUrl = new Uint8Array(arrayBuffer);
      }
    };
    reader.readAsArrayBuffer(file);

    // Parse PDF
    this.isLoading = true;
    this.errorMessage = '';
    this.extractedRequirements = [];

    this.pdfParserService.parsePdf(file).subscribe({
      next: (response) => {
        this.extractedRequirements = this.filterRequirements(response.text);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error parsing PDF: ' + err.message;
        this.isLoading = false;
      }
    });
  }

  private filterRequirements(text: string): any[] {
    // Define your keywords to search for
    const requirementKeywords = ['shall', 'must', 'required', 'requirement'];
    const sectionKeywords = ['requirements', 'specifications', 'scope'];

    // Simple parsing logic - you'll want to enhance this
    const lines = text.split('\n');
    const requirements: any[] = [];

    lines.forEach((line, index) => {
      if (requirementKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
        requirements.push({
          text: line.trim(),
          page: Math.floor(index / 50) + 1, // Approximate page number
          isCritical: line.toLowerCase().includes('shall') || line.toLowerCase().includes('must')
        });
      }
    });

    return requirements;
  }
}
