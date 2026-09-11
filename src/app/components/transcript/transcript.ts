import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranscriptEntry } from '../../services/transcript';

@Component({
  selector: 'app-transcript-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transcript.html',
  styleUrls: ['./transcript.scss']
})
export class TranscriptViewComponent {
  @Input() entries: TranscriptEntry[] = [];
}