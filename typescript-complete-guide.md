# Complete TypeScript Guide: From Basics to Next.js

## Table of Contents

1. [Introduction to TypeScript](#introduction-to-typescript)
2. [TypeScript Fundamentals](#typescript-fundamentals)
3. [Advanced TypeScript Concepts](#advanced-typescript-concepts)
4. [TypeScript with Next.js](#typescript-with-nextjs)
5. [JavaScript vs TypeScript in Next.js](#javascript-vs-typescript-in-nextjs)
6. [Migration Guide: JS to TS in Next.js](#migration-guide-js-to-ts-in-nextjs)
7. [Best Practices](#best-practices)
8. [Common Patterns and Examples](#common-patterns-and-examples)

---

## Introduction to TypeScript

TypeScript is a strongly typed programming language that builds on JavaScript by adding static type definitions. It was developed by Microsoft and has become the standard for large-scale JavaScript applications.

### Why TypeScript?

- **Type Safety**: Catch errors at compile time rather than runtime
- **Better IDE Support**: Enhanced autocomplete, refactoring, and navigation
- **Self-Documenting Code**: Types serve as inline documentation
- **Easier Refactoring**: Confident code changes with type checking
- **Better Team Collaboration**: Clear contracts between different parts of code

### TypeScript vs JavaScript

```typescript
// JavaScript
function greet(name) {
    return "Hello, " + name;
}

// TypeScript
function greet(name: string): string {
    return "Hello, " + name;
}
```

---

## TypeScript Fundamentals

### 1. Basic Types

#### Primitive Types

```typescript
// String
let message: string = "Hello, TypeScript!";

// Number
let age: number = 25;
let price: number = 99.99;

// Boolean
let isActive: boolean = true;

// Undefined and Null
let undefinedValue: undefined = undefined;
let nullValue: null = null;
```

#### Arrays

```typescript
// Array of numbers
let numbers: number[] = [1, 2, 3, 4, 5];
let numbers2: Array<number> = [1, 2, 3, 4, 5];

// Array of strings
let fruits: string[] = ["apple", "banana", "orange"];

// Mixed array (not recommended)
let mixed: (string | number)[] = ["hello", 42, "world"];
```

#### Objects

```typescript
// Object type annotation
let person: {
    name: string;
    age: number;
    isEmployed: boolean;
} = {
    name: "John Doe",
    age: 30,
    isEmployed: true
};

// Optional properties
let user: {
    name: string;
    age?: number; // Optional property
} = {
    name: "Jane"
};
```

### 2. Interfaces

Interfaces define the structure of objects and provide a way to name these types.

```typescript
// Basic interface
interface User {
    id: number;
    name: string;
    email: string;
    age?: number; // Optional property
}

// Using the interface
const user: User = {
    id: 1,
    name: "John Doe",
    email: "john@example.com"
};

// Interface with methods
interface Calculator {
    add(a: number, b: number): number;
    subtract(a: number, b: number): number;
}

const calc: Calculator = {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b
};

// Extending interfaces
interface Employee extends User {
    department: string;
    salary: number;
}

const employee: Employee = {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    department: "Engineering",
    salary: 75000
};
```

### 3. Type Aliases

Type aliases create a new name for a type.

```typescript
// Basic type alias
type Status = "pending" | "approved" | "rejected";

// Object type alias
type Product = {
    id: number;
    name: string;
    price: number;
    category: string;
};

// Function type alias
type EventHandler = (event: Event) => void;

// Generic type alias
type ApiResponse<T> = {
    data: T;
    status: number;
    message: string;
};
```

### 4. Union and Intersection Types

#### Union Types

```typescript
// Union types (OR)
type StringOrNumber = string | number;

let value: StringOrNumber = "hello";
value = 42; // Both are valid

// Function with union parameter
function formatId(id: string | number): string {
    return `ID: ${id}`;
}

// Discriminated unions
type Shape = 
    | { kind: "circle"; radius: number }
    | { kind: "rectangle"; width: number; height: number }
    | { kind: "square"; size: number };

function getArea(shape: Shape): number {
    switch (shape.kind) {
        case "circle":
            return Math.PI * shape.radius ** 2;
        case "rectangle":
            return shape.width * shape.height;
        case "square":
            return shape.size ** 2;
    }
}
```

#### Intersection Types

```typescript
// Intersection types (AND)
type Timestamped = {
    createdAt: Date;
    updatedAt: Date;
};

type User = {
    id: number;
    name: string;
};

type TimestampedUser = User & Timestamped;

const user: TimestampedUser = {
    id: 1,
    name: "John",
    createdAt: new Date(),
    updatedAt: new Date()
};
```

### 5. Functions

```typescript
// Function declaration
function add(a: number, b: number): number {
    return a + b;
}

// Function expression
const multiply = (a: number, b: number): number => {
    return a * b;
};

// Optional parameters
function greet(name: string, greeting?: string): string {
    return `${greeting || "Hello"}, ${name}!`;
}

// Default parameters
function createUser(name: string, age: number = 18): User {
    return { id: Date.now(), name, age };
}

// Rest parameters
function sum(...numbers: number[]): number {
    return numbers.reduce((total, num) => total + num, 0);
}

// Function overloads
function process(value: string): string;
function process(value: number): number;
function process(value: string | number): string | number {
    if (typeof value === "string") {
        return value.toUpperCase();
    }
    return value * 2;
}
```

### 6. Enums

```typescript
// Numeric enum
enum Direction {
    Up,    // 0
    Down,  // 1
    Left,  // 2
    Right  // 3
}

// String enum
enum Color {
    Red = "red",
    Green = "green",
    Blue = "blue"
}

// Using enums
let direction: Direction = Direction.Up;
let color: Color = Color.Red;

// Const enums (more efficient)
const enum HttpStatus {
    OK = 200,
    NotFound = 404,
    InternalServerError = 500
}
```

---

## Advanced TypeScript Concepts

### 1. Generics

Generics provide a way to create reusable components that work with multiple types.

```typescript
// Generic function
function identity<T>(arg: T): T {
    return arg;
}

let stringResult = identity<string>("hello");
let numberResult = identity<number>(42);

// Generic interface
interface Repository<T> {
    create(item: T): T;
    findById(id: number): T | null;
    update(id: number, item: Partial<T>): T;
    delete(id: number): boolean;
}

// Generic class
class DataStore<T> {
    private items: T[] = [];

    add(item: T): void {
        this.items.push(item);
    }

    get(index: number): T | undefined {
        return this.items[index];
    }

    getAll(): T[] {
        return [...this.items];
    }
}

// Generic constraints
interface Lengthwise {
    length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
    console.log(arg.length);
    return arg;
}

// Multiple generic parameters
function merge<T, U>(obj1: T, obj2: U): T & U {
    return { ...obj1, ...obj2 };
}
```

### 2. Utility Types

TypeScript provides several utility types for common type transformations.

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    age: number;
}

// Partial<T> - makes all properties optional
type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string; age?: number; }

// Required<T> - makes all properties required
type RequiredUser = Required<PartialUser>;

// Pick<T, K> - picks specific properties
type UserSummary = Pick<User, "id" | "name">;
// { id: number; name: string; }

// Omit<T, K> - omits specific properties
type UserWithoutId = Omit<User, "id">;
// { name: string; email: string; age: number; }

// Record<K, T> - creates object type with specific keys and values
type UserRoles = Record<string, "admin" | "user" | "guest">;
// { [key: string]: "admin" | "user" | "guest"; }

// Exclude<T, U> - excludes types from union
type NonNullable<T> = Exclude<T, null | undefined>;

// Extract<T, U> - extracts types from union
type StringOrNumber = Extract<string | number | boolean, string | number>;
// string | number

// ReturnType<T> - gets return type of function
function getUser(): User {
    return { id: 1, name: "John", email: "john@example.com", age: 30 };
}
type UserReturnType = ReturnType<typeof getUser>; // User
```

### 3. Mapped Types

```typescript
// Basic mapped type
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};

// Conditional mapped type
type Nullable<T> = {
    [P in keyof T]: T[P] | null;
};

// Template literal types
type EventName<T extends string> = `on${Capitalize<T>}`;
type ButtonEvents = EventName<"click" | "hover">; // "onClick" | "onHover"

// Key remapping
type Getters<T> = {
    [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type UserGetters = Getters<User>;
// {
//     getId: () => number;
//     getName: () => string;
//     getEmail: () => string;
//     getAge: () => number;
// }
```

### 4. Conditional Types

```typescript
// Basic conditional type
type IsString<T> = T extends string ? true : false;

type Test1 = IsString<string>; // true
type Test2 = IsString<number>; // false

// Distributive conditional types
type ToArray<T> = T extends any ? T[] : never;
type StringOrNumberArray = ToArray<string | number>; // string[] | number[]

// infer keyword
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type ArrayElement<T> = T extends (infer U)[] ? U : never;

type StringArray = ArrayElement<string[]>; // string
```

### 5. Classes

```typescript
// Basic class
class Animal {
    protected name: string;
    private age: number;

    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }

    public speak(): void {
        console.log(`${this.name} makes a sound`);
    }

    protected getAge(): number {
        return this.age;
    }
}

// Inheritance
class Dog extends Animal {
    private breed: string;

    constructor(name: string, age: number, breed: string) {
        super(name, age);
        this.breed = breed;
    }

    public speak(): void {
        console.log(`${this.name} barks`);
    }

    public getInfo(): string {
        return `${this.name} is a ${this.breed}, age ${this.getAge()}`;
    }
}

// Abstract classes
abstract class Shape {
    abstract getArea(): number;
    
    protected displayArea(): void {
        console.log(`Area: ${this.getArea()}`);
    }
}

class Circle extends Shape {
    constructor(private radius: number) {
        super();
    }

    getArea(): number {
        return Math.PI * this.radius ** 2;
    }
}

// Class implementing interface
interface Flyable {
    fly(): void;
}

class Bird implements Flyable {
    fly(): void {
        console.log("Flying...");
    }
}
```

### 6. Decorators

```typescript
// Class decorator
function Component(target: any) {
    target.prototype.isComponent = true;
}

@Component
class MyComponent {
    render() {
        return "<div>Hello World</div>";
    }
}

// Method decorator
function Log(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    descriptor.value = function (...args: any[]) {
        console.log(`Calling ${propertyName} with args:`, args);
        return method.apply(this, args);
    };
}

class Calculator {
    @Log
    add(a: number, b: number): number {
        return a + b;
    }
}

// Property decorator
function MinLength(length: number) {
    return function (target: any, propertyName: string) {
        let value: string;
        
        const getter = () => value;
        const setter = (newVal: string) => {
            if (newVal.length < length) {
                throw new Error(`${propertyName} must be at least ${length} characters`);
            }
            value = newVal;
        };

        Object.defineProperty(target, propertyName, {
            get: getter,
            set: setter
        });
    };
}

class User {
    @MinLength(3)
    username: string;
}
```

---

## TypeScript with Next.js

### 1. Setting Up TypeScript in Next.js

#### New Next.js Project with TypeScript

```bash
npx create-next-app@latest my-app --typescript
# or
npx create-next-app@latest my-app --ts
```

#### Adding TypeScript to Existing Next.js Project

```bash
# Install TypeScript and types
npm install --save-dev typescript @types/react @types/node

# Create tsconfig.json
touch tsconfig.json

# Start the development server (Next.js will populate tsconfig.json)
npm run dev
```

### 2. Next.js TypeScript Configuration

#### tsconfig.json for Next.js

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/utils/*": ["./src/utils/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 3. Next.js Specific Types

#### Page Components

```typescript
// pages/index.tsx or app/page.tsx
import { NextPage } from 'next';
import { GetStaticProps, GetServerSideProps } from 'next';

interface HomeProps {
  posts: Post[];
  user?: User;
}

const Home: NextPage<HomeProps> = ({ posts, user }) => {
  return (
    <div>
      <h1>Welcome {user?.name}</h1>
      {posts.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
};

export default Home;

// Static props
export const getStaticProps: GetStaticProps<HomeProps> = async (context) => {
  const posts = await fetchPosts();
  
  return {
    props: {
      posts,
    },
    revalidate: 60, // ISR
  };
};

// Server-side props
export const getServerSideProps: GetServerSideProps<HomeProps> = async (context) => {
  const { req, res, query } = context;
  const posts = await fetchPosts();
  const user = await getUser(req);

  return {
    props: {
      posts,
      user,
    },
  };
};
```

#### API Routes

```typescript
// pages/api/users.ts or app/api/users/route.ts
import { NextApiRequest, NextApiResponse } from 'next';

interface User {
  id: number;
  name: string;
  email: string;
}

interface ApiResponse {
  success: boolean;
  data?: User[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === 'GET') {
    try {
      const users = await getUsers();
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

// App Router API Routes (app/api/users/route.ts)
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const users = await getUsers();
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await createUser(body);
    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
```

#### Custom App and Document

```typescript
// pages/_app.tsx
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App({ 
  Component, 
  pageProps: { session, ...pageProps } 
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </SessionProvider>
  );
}

// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document';
import Document, { DocumentContext, DocumentInitialProps } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx);
    return initialProps;
  }

  render() {
    return (
      <Html lang="en">
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
```

### 4. React Component Types in Next.js

```typescript
import React, { ReactNode, FC, PropsWithChildren } from 'react';

// Functional Component with Props
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
}

const Button: FC<ButtonProps> = ({ 
  variant, 
  size = 'medium', 
  disabled = false, 
  onClick, 
  children 
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Component with children
interface LayoutProps {
  title: string;
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ title, children }) => {
  return (
    <div>
      <header>
        <h1>{title}</h1>
      </header>
      <main>{children}</main>
    </div>
  );
};

// Generic component
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T) => string | number;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
}

// Usage
const users = [
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' }
];

<List
  items={users}
  keyExtractor={(user) => user.id}
  renderItem={(user) => <span>{user.name}</span>}
/>
```

### 5. Hooks with TypeScript

```typescript
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// useState with explicit type
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState<boolean>(false);
const [error, setError] = useState<string>('');

// useEffect
useEffect(() => {
  const fetchUser = async () => {
    try {
      setLoading(true);
      const userData = await api.getUser();
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  fetchUser();
}, []);

// useCallback with types
const handleSubmit = useCallback((data: FormData) => {
  // Handle form submission
}, []);

// useMemo with types
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// useRef with types
const inputRef = useRef<HTMLInputElement>(null);
const timerRef = useRef<NodeJS.Timeout | null>(null);

// Custom hook
function useApi<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}

// Usage
const { data: users, loading, error } = useApi<User[]>('/api/users');
```

### 6. Next.js Middleware with TypeScript

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!token || token.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect API routes
  if (pathname.startsWith('/api/protected')) {
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/protected/:path*']
};
```

---

## JavaScript vs TypeScript in Next.js

### 1. File Extensions and Structure

#### JavaScript Next.js Project
```
pages/
  index.js
  about.js
  api/
    users.js
components/
  Header.js
  Footer.js
utils/
  helpers.js
```

#### TypeScript Next.js Project
```
pages/
  index.tsx
  about.tsx
  api/
    users.ts
components/
  Header.tsx
  Footer.tsx
utils/
  helpers.ts
types/
  index.ts
  api.ts
```

### 2. Component Definitions

#### JavaScript Component
```javascript
// components/UserCard.js
import { useState } from 'react';

const UserCard = ({ user, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (userData) => {
    // No type checking - potential runtime errors
    onEdit(userData);
    setIsEditing(false);
  };

  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      {isEditing ? (
        <EditForm user={user} onSave={handleSave} />
      ) : (
        <button onClick={() => setIsEditing(true)}>Edit</button>
      )}
    </div>
  );
};

export default UserCard;
```

#### TypeScript Component
```typescript
// components/UserCard.tsx
import { useState, FC } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
}

const UserCard: FC<UserCardProps> = ({ user, onEdit }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleSave = (userData: User) => {
    // Type-safe - compiler ensures userData matches User interface
    onEdit(userData);
    setIsEditing(false);
  };

  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      {user.avatar && <img src={user.avatar} alt={user.name} />}
      {isEditing ? (
        <EditForm user={user} onSave={handleSave} />
      ) : (
        <button onClick={() => setIsEditing(true)}>Edit</button>
      )}
    </div>
  );
};

export default UserCard;
```

### 3. API Routes Comparison

#### JavaScript API Route
```javascript
// pages/api/users.js
export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // No type checking on request/response
      const users = await getUsers();
      res.status(200).json({ users });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
```

#### TypeScript API Route
```typescript
// pages/api/users.ts
import { NextApiRequest, NextApiResponse } from 'next';

interface User {
  id: number;
  name: string;
  email: string;
}

interface ApiResponse {
  users?: User[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === 'GET') {
    try {
      const users: User[] = await getUsers();
      res.status(200).json({ users });
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
```

### 4. Data Fetching Comparison

#### JavaScript getServerSideProps
```javascript
// pages/users.js
export async function getServerSideProps(context) {
  try {
    const users = await fetchUsers();
    return {
      props: {
        users,
      },
    };
  } catch (error) {
    return {
      props: {
        users: [],
        error: error.message,
      },
    };
  }
}

const UsersPage = ({ users, error }) => {
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
};
```

#### TypeScript getServerSideProps
```typescript
// pages/users.tsx
import { GetServerSideProps, NextPage } from 'next';

interface User {
  id: number;
  name: string;
  email: string;
}

interface UsersPageProps {
  users: User[];
  error?: string;
}

export const getServerSideProps: GetServerSideProps<UsersPageProps> = async (context) => {
  try {
    const users: User[] = await fetchUsers();
    return {
      props: {
        users,
      },
    };
  } catch (error) {
    return {
      props: {
        users: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
};

const UsersPage: NextPage<UsersPageProps> = ({ users, error }) => {
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
};

export default UsersPage;
```

### 5. Configuration Files

#### JavaScript Configuration
```javascript
// next.config.js
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['example.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;
```

#### TypeScript Configuration
```typescript
// next.config.ts
import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['example.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
```

### 6. Key Differences Summary

| Aspect | JavaScript | TypeScript |
|--------|------------|------------|
| **File Extensions** | `.js`, `.jsx` | `.ts`, `.tsx` |
| **Type Safety** | Runtime errors | Compile-time errors |
| **IDE Support** | Basic autocomplete | Rich IntelliSense |
| **Refactoring** | Manual, error-prone | Safe, automated |
| **Documentation** | External docs needed | Self-documenting |
| **Learning Curve** | Easier to start | Steeper initial curve |
| **Build Process** | Direct compilation | Type checking + compilation |
| **Bundle Size** | Smaller (no types) | Same (types stripped) |

---

## Migration Guide: JS to TS in Next.js

### 1. Step-by-Step Migration Process

#### Step 1: Install TypeScript Dependencies

```bash
npm install --save-dev typescript @types/react @types/node
# If using React 18+
npm install --save-dev @types/react-dom
```

#### Step 2: Create TypeScript Configuration

Create `tsconfig.json` in your project root:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

#### Step 3: Create next-env.d.ts

```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
```

#### Step 4: Gradual File Migration

Start with utility files and work your way up:

1. **Utility Functions**
```javascript
// utils/helpers.js (Before)
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};
```

```typescript
// utils/helpers.ts (After)
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};
```

2. **Type Definitions**
```typescript
// types/index.ts
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  inStock: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type UserRole = 'admin' | 'user' | 'moderator';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
```

3. **API Routes Migration**
```javascript
// pages/api/products.js (Before)
export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const products = await getProducts();
        res.status(200).json({ success: true, data: products });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
      break;
    
    case 'POST':
      try {
        const product = await createProduct(req.body);
        res.status(201).json({ success: true, data: product });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
```

```typescript
// pages/api/products.ts (After)
import { NextApiRequest, NextApiResponse } from 'next';
import { Product, ApiResponse } from '../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Product | Product[]>>
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const products: Product[] = await getProducts();
        res.status(200).json({ success: true, data: products });
      } catch (error) {
        res.status(500).json({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
      break;
    
    case 'POST':
      try {
        const product: Product = await createProduct(req.body);
        res.status(201).json({ success: true, data: product });
      } catch (error) {
        res.status(400).json({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
      break;
    
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
```

4. **Component Migration**
```javascript
// components/ProductCard.js (Before)
import { useState } from 'react';

const ProductCard = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await onAddToCart(product.id, quantity);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-card">
      <img src={product.imageUrl} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <span className="price">${product.price}</span>
      <div className="quantity-selector">
        <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
        <span>{quantity}</span>
        <button onClick={() => setQuantity(quantity + 1)}>+</button>
      </div>
      <button 
        onClick={handleAddToCart} 
        disabled={loading || !product.inStock}
      >
        {loading ? 'Adding...' : 'Add to Cart'}
      </button>
    </div>
  );
};

export default ProductCard;
```

```typescript
// components/ProductCard.tsx (After)
import { useState, FC } from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: number, quantity: number) => Promise<void>;
}

const ProductCard: FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const handleAddToCart = async (): Promise<void> => {
    setLoading(true);
    try {
      await onAddToCart(product.id, quantity);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const decreaseQuantity = (): void => {
    setQuantity(Math.max(1, quantity - 1));
  };

  const increaseQuantity = (): void => {
    setQuantity(quantity + 1);
  };

  return (
    <div className="product-card">
      <img src={product.imageUrl} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <span className="price">${product.price}</span>
      <div className="quantity-selector">
        <button onClick={decreaseQuantity}>-</button>
        <span>{quantity}</span>
        <button onClick={increaseQuantity}>+</button>
      </div>
      <button 
        onClick={handleAddToCart} 
        disabled={loading || !product.inStock}
      >
        {loading ? 'Adding...' : 'Add to Cart'}
      </button>
    </div>
  );
};

export default ProductCard;
```

### 2. Migration Strategies

#### Incremental Migration
- Start with `"strict": false` in tsconfig.json
- Enable `"allowJs": true` to allow JS and TS files to coexist
- Migrate files one by one
- Gradually enable stricter type checking

#### Big Bang Migration
- Convert all files at once
- Use automated tools like `ts-migrate`
- Fix all type errors before deployment

#### Recommended Approach
```typescript
// tsconfig.json - Start with lenient settings
{
  "compilerOptions": {
    "strict": false,
    "allowJs": true,
    "noImplicitAny": false,
    "noImplicitReturns": false,
    "noImplicitThis": false,
    "strictNullChecks": false
  }
}

// Gradually enable stricter settings
{
  "compilerOptions": {
    "strict": true,
    "allowJs": false,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "strictNullChecks": true
  }
}
```

### 3. Common Migration Challenges and Solutions

#### Challenge 1: Implicit Any Types
```typescript
// Problem
const processData = (data) => { // implicit any
  return data.map(item => item.value);
};

// Solution
interface DataItem {
  value: number;
  label: string;
}

const processData = (data: DataItem[]): number[] => {
  return data.map(item => item.value);
};
```

#### Challenge 2: Event Handlers
```typescript
// Problem
const handleClick = (e) => { // implicit any
  e.preventDefault();
};

// Solution
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
};
```

#### Challenge 3: Third-party Libraries
```bash
# Install type definitions
npm install --save-dev @types/lodash
npm install --save-dev @types/uuid

# For libraries without types, create custom declarations
// types/custom.d.ts
declare module 'some-library' {
  export function someFunction(param: string): number;
}
```

---

## Best Practices

### 1. Type Definition Best Practices

#### Use Interfaces for Object Shapes
```typescript
// Good
interface User {
  id: number;
  name: string;
  email: string;
}

// Avoid for simple object shapes
type User = {
  id: number;
  name: string;
  email: string;
};
```

#### Use Type Aliases for Unions and Primitives
```typescript
// Good
type Status = 'loading' | 'success' | 'error';
type ID = string | number;

// Avoid
interface Status {
  value: 'loading' | 'success' | 'error';
}
```

#### Prefer Composition over Large Interfaces
```typescript
// Good
interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

interface User extends BaseEntity {
  name: string;
  email: string;
}

interface Product extends BaseEntity {
  name: string;
  price: number;
}

// Avoid
interface User {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  email: string;
}
```

### 2. Component Best Practices

#### Use Proper React Types
```typescript
import { FC, ReactNode, PropsWithChildren } from 'react';

// For components with children
interface LayoutProps {
  title: string;
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ title, children }) => {
  return (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  );
};

// Alternative using PropsWithChildren
const Layout: FC<PropsWithChildren<{ title: string }>> = ({ title, children }) => {
  return (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  );
};
```

#### Event Handler Types
```typescript
// Button click
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  // Handle click
};

// Form submission
const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  // Handle form submission
};

// Input change
const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setValue(event.target.value);
};
```

### 3. API and Data Fetching Best Practices

#### Type API Responses
```typescript
// Define API response types
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Use with fetch
const fetchUsers = async (): Promise<ApiResponse<User[]>> => {
  const response = await fetch('/api/users');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};
```

#### Custom Hooks with Types
```typescript
interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function useApi<T>(url: string): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: T = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
```

### 4. Next.js Specific Best Practices

#### Environment Variables
```typescript
// types/env.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      NEXTAUTH_SECRET: string;
      NEXTAUTH_URL: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
    }
  }
}

export {};
```

#### Middleware Types
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

interface AuthToken {
  userId: string;
  role: 'admin' | 'user';
  exp: number;
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const decoded: AuthToken = jwt.verify(token, process.env.JWT_SECRET!) as AuthToken;
    
    // Add user info to headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-user-role', decoded.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

### 5. Performance Best Practices

#### Use const assertions for immutable data
```typescript
// Good
const STATUSES = ['pending', 'approved', 'rejected'] as const;
type Status = typeof STATUSES[number]; // 'pending' | 'approved' | 'rejected'

// Avoid
const STATUSES = ['pending', 'approved', 'rejected'];
type Status = string; // Too broad
```

#### Prefer unknown over any
```typescript
// Good
const parseJson = (json: string): unknown => {
  return JSON.parse(json);
};

// Type guard
const isUser = (obj: unknown): obj is User => {
  return typeof obj === 'object' && 
         obj !== null && 
         'id' in obj && 
         'name' in obj;
};

// Avoid
const parseJson = (json: string): any => {
  return JSON.parse(json);
};
```

---

## Common Patterns and Examples

### 1. Form Handling Patterns

#### Controlled Forms with TypeScript
```typescript
import { useState, FormEvent, ChangeEvent } from 'react';

interface FormData {
  name: string;
  email: string;
  age: number;
}

interface FormErrors {
  name?: string;
  email?: string;
  age?: string;
}

const UserForm: FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    age: 0,
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (formData.age < 18) {
      newErrors.age = 'Must be at least 18 years old';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await submitForm(formData);
      // Handle success
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>
      
      <div>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      
      <div>
        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
          placeholder="Age"
        />
        {errors.age && <span className="error">{errors.age}</span>}
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};
```

### 2. State Management Patterns

#### Context with TypeScript
```typescript
import { createContext, useContext, useReducer, ReactNode } from 'react';

// State types
interface User {
  id: string;
  name: string;
  email: string;
}

interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  loading: boolean;
}

// Action types
type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'CLEAR_USER' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_LOADING'; payload: boolean };

// Context types
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'CLEAR_USER':
      return { ...state, user: null };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, {
    user: null,
    theme: 'light',
    loading: false,
  });

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Usage in component
const UserProfile: FC = () => {
  const { state, dispatch } = useApp();

  const handleLogin = (user: User) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  const handleLogout = () => {
    dispatch({ type: 'CLEAR_USER' });
  };

  return (
    <div>
      {state.user ? (
        <div>
          <h1>Welcome, {state.user.name}!</h1>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <h1>Please log in</h1>
        </div>
      )}
    </div>
  );
};
```

### 3. Data Fetching Patterns

#### SWR with TypeScript
```typescript
import useSWR from 'swr';

interface User {
  id: number;
  name: string;
  email: string;
}

interface ApiResponse<T> {
  data: T;
  message: string;
}

// Fetcher function with types
const fetcher = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch');
  }
  return response.json();
};

// Custom hook for fetching users
const useUsers = () => {
  const { data, error, mutate } = useSWR<ApiResponse<User[]>>(
    '/api/users',
    fetcher
  );

  return {
    users: data?.data,
    loading: !error && !data,
    error,
    mutate,
  };
};

// Usage in component
const UsersList: FC = () => {
  const { users, loading, error } = useUsers();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};
```

#### React Query with TypeScript
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// API functions
const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch('/api/users');
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
};

const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    throw new Error('Failed to create user');
  }
  return response.json();
};

// Custom hooks
const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });
};

const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Usage in component
const UsersManager: FC = () => {
  const { data: users, isLoading, error } = useUsers();
  const createUserMutation = useCreateUser();

  const handleCreateUser = (userData: Omit<User, 'id'>) => {
    createUserMutation.mutate(userData);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users?.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      <button 
        onClick={() => handleCreateUser({ name: 'New User', email: 'new@example.com' })}
        disabled={createUserMutation.isPending}
      >
        {createUserMutation.isPending ? 'Creating...' : 'Create User'}
      </button>
    </div>
  );
};
```

### 4. Error Handling Patterns

#### Error Boundaries with TypeScript
```typescript
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
const App: FC = () => {
  return (
    <ErrorBoundary fallback={<div>Custom error message</div>}>
      <UsersList />
    </ErrorBoundary>
  );
};
```

#### Custom Error Types
```typescript
// Custom error classes
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ValidationError extends Error {
  constructor(
    message: string,
    public field: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Error handling utility
const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return `API Error (${error.status}): ${error.message}`;
  }
  
  if (error instanceof ValidationError) {
    return `Validation Error in ${error.field}: ${error.message}`;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
};

// Usage in API function
const fetchUserData = async (id: number): Promise<User> => {
  try {
    const response = await fetch(`/api/users/${id}`);
    
    if (!response.ok) {
      throw new ApiError(
        'Failed to fetch user',
        response.status,
        'USER_FETCH_ERROR'
      );
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error', 0, 'NETWORK_ERROR');
  }
};
```

### 5. Authentication Patterns

#### JWT Authentication with TypeScript
```typescript
// Auth types
interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  user: AuthUser;
  token: string;
}

// Auth context
const AuthContext = createContext<{
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
} | undefined>(undefined);

// Auth provider
export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
  });

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data: AuthResponse = await response.json();
      
      localStorage.setItem('token', data.token);
      
      setState({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
    });
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      const response = await fetch('/api/auth/refresh', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        logout();
        return;
      }

      const data: AuthResponse = await response.json();
      
      localStorage.setItem('token', data.token);
      
      setState({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      logout();
    }
  };

  useEffect(() => {
    refreshToken();
  }, []);

  return (
    <AuthContext.Provider value={{ state, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Protected route component
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user';
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { state } = useAuth();

  if (state.loading) {
    return <div>Loading...</div>;
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && state.user?.role !== requiredRole) {
    return <div>Access denied</div>;
  }

  return <>{children}</>;
};
```

### 6. Performance Optimization Patterns

#### Memoization with TypeScript
```typescript
import { memo, useMemo, useCallback } from 'react';

// Memoized component
interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
}

const UserCard = memo<UserCardProps>(({ user, onEdit, onDelete }) => {
  const handleEdit = useCallback(() => {
    onEdit(user);
  }, [user, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(user.id);
  }, [user.id, onDelete]);

  const userDisplayName = useMemo(() => {
    return `${user.name} (${user.email})`;
  }, [user.name, user.email]);

  return (
    <div className="user-card">
      <h3>{userDisplayName}</h3>
      <button onClick={handleEdit}>Edit</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
});

UserCard.displayName = 'UserCard';

// Parent component with proper memoization
const UsersList: FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  const handleEditUser = useCallback((user: User) => {
    // Edit logic
  }, []);

  const handleDeleteUser = useCallback((id: number) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  }, []);

  return (
    <div>
      {users.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        />
      ))}
    </div>
  );
};
```

### 7. Testing Patterns

#### Component Testing with TypeScript
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import UserCard from './UserCard';

// Mock data
const mockUser: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
};

// Mock functions with proper typing
const mockOnEdit = vi.fn<[User], void>();
const mockOnDelete = vi.fn<[number], void>();

describe('UserCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user information correctly', () => {
    render(
      <UserCard
        user={mockUser}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('John Doe (john@example.com)')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <UserCard
        user={mockUser}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText('Edit'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockUser);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <UserCard
        user={mockUser}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText('Delete'));
    expect(mockOnDelete).toHaveBeenCalledWith(mockUser.id);
  });
});

// API testing
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.json<User[]>([
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      ])
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useUsers hook', () => {
  it('fetches users successfully', async () => {
    const { result } = renderHook(() => useUsers());

    await waitFor(() => {
      expect(result.current.users).toHaveLength(2);
    });

    expect(result.current.users?.[0].name).toBe('John Doe');
  });
});
```

---

## Conclusion

This comprehensive TypeScript guide covers everything from basic concepts to advanced patterns specifically tailored for Next.js development. TypeScript provides significant benefits in terms of type safety, developer experience, and code maintainability, especially in large-scale applications.

### Key Takeaways

1. **Start Simple**: Begin with basic types and gradually adopt more advanced features
2. **Incremental Adoption**: Migrate from JavaScript to TypeScript gradually
3. **Leverage IDE Support**: Take advantage of enhanced autocomplete and error detection
4. **Use Proper Types**: Prefer interfaces for objects and type aliases for unions
5. **Type Your APIs**: Always type your API responses and request payloads
6. **Error Handling**: Implement proper error types and handling patterns
7. **Performance**: Use memoization and proper React patterns with TypeScript
8. **Testing**: Write type-safe tests with proper mocking

### Next Steps

1. Practice with small projects to build familiarity
2. Gradually migrate existing JavaScript projects
3. Explore advanced TypeScript features as needed
4. Stay updated with TypeScript and Next.js releases
5. Contribute to open-source TypeScript projects

TypeScript with Next.js provides a powerful combination for building robust, scalable web applications. The initial learning curve is worth the long-term benefits in code quality, developer productivity, and application reliability.

---

*This guide serves as a comprehensive reference for TypeScript development with Next.js. Keep it handy as you build your TypeScript applications!*
