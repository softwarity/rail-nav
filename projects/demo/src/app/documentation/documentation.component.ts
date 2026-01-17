import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
// Register interactive-code custom elements
import { registerInteractiveCode } from '@softwarity/interactive-code';
registerInteractiveCode();

@Component({
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './documentation.component.html',
  styleUrl: './documentation.component.scss'
})
export class DocumentationComponent {}
