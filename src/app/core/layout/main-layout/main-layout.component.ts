import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { LayoutService } from '../layout.service';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './main-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  private readonly layoutService = inject(LayoutService);
  readonly isMobileMenuOpen = this.layoutService.isMobileMenuOpen;

  closeMobileMenu() {
    this.layoutService.closeMobileMenu();
  }
}
