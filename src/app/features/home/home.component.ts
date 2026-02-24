import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-zinc-900 overflow-hidden">
      <!-- Navbar -->
      <nav
        class="bg-white dark:bg-zinc-800 shadow-sm border-b border-gray-100 dark:border-zinc-700"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16 items-center">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-900 dark:text-white">cookBookAI</h1>
            </div>
            <div>
              <button
                (click)="logout()"
                type="button"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content Area -->
      <main class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Welcome to cookBookAI
          </h2>
          <p class="mt-4 text-lg text-gray-500 dark:text-gray-400">
            You are successfully logged in! The application shell is ready.
          </p>

          <div class="mt-12 flex justify-center">
            <!-- Placeholder Content Cards -->
            <div
              class="bg-white dark:bg-zinc-800 overflow-hidden shadow rounded-lg border border-gray-100 dark:border-zinc-700 w-full max-w-sm"
            >
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-blue-100 rounded-md p-3">
                    <svg
                      class="h-6 w-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Recipes
                      </dt>
                      <dd class="text-lg font-medium text-gray-900 dark:text-white">Coming soon</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
