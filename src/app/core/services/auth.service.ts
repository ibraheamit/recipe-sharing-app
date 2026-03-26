import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  bio: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/users`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Simulated login since json-server doesn't provide real auth
  login(email: string, password?: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}?email=${email}`).pipe(
      map(users => {
        if (!password) return users;
        return users.filter(u => u.password === password);
      }),
      tap(users => {
        if (users && users.length > 0) {
          localStorage.setItem('currentUser', JSON.stringify(users[0]));
          this.currentUserSubject.next(users[0]);
        }
      })
    );
  }

  register(user: Omit<User, 'id'>): Observable<User> {
    const newUser = { ...user, id: String(Date.now()) };
    return this.http.post<User>(this.apiUrl, newUser).pipe(
      tap(createdUser => {
        localStorage.setItem('currentUser', JSON.stringify(createdUser));
        this.currentUserSubject.next(createdUser);
      })
    );
  }

  updateProfile(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${user.id}`, user).pipe(
      tap(updatedUser => {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        this.currentUserSubject.next(updatedUser);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
