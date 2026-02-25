import { UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [UpperCasePipe],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);

  readonly user = this.authService.user;

  readonly userInitials = computed(() => {
    const user = this.user();
    if (!user) return '?';

    if (user.displayName) {
      const names = user.displayName.split(' ');
      if (names.length >= 2) {
        return names[0][0] + names[1][0];
      }
      return names[0].substring(0, 2);
    }

    if (user.email) {
      return user.email.substring(0, 2);
    }

    return 'U';
  });

  logout() {
    this.authService.logout();
  }
}
