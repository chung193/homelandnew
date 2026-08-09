
Repo: hdeawy/api-starter-kit
👉 Mục tiêu: Starter kit cho REST API (Laravel) theo Clean Architecture / DDD-ish

🎯 Mục tiêu của repo này là gì?

Làm API-only backend (không view Blade)

Tách rõ:

- Business logic

- HTTP layer

- Infrastructure

- Dễ test

- Dễ scale team

👉 Không phải Laravel “truyền thống” controller → model → view

🧱 Tổng thể kiến trúc

Repo này theo mô hình:

- HTTP → Application → Domain → Infrastructure

Nó gần với:

- Clean Architecture

- Hexagonal Architecture

Service-oriented

📁 Giải thích từng thư mục chính
1️⃣ app/Http

👉 Lớp giao tiếp HTTP

app/Http/
 ├─ Controllers/
 ├─ Middleware/
 ├─ Requests/
 └─ Resources/

🔹 Controllers

Controller rất mỏng

Chỉ:

- Nhận request

- Gọi action / service

- Trả response

❌ Không xử lý business logic ở đây

🔹 Requests

- Validate input

- Authorize

- class StoreUserRequest extends FormRequest

🔹 Resources

- Transform response JSON

- Tách khỏi model

👉 API response ổn định, không phụ thuộc DB structure

2️⃣ app/Actions

👉 Use case / Application layer

Ví dụ:

- app/Actions/User/CreateUserAction.php

Nhiệm vụ:

- Thực hiện 1 hành động nghiệp vụ

Có thể:

- gọi repository

- gọi domain service

- dispatch event

👉 Giống Use Case trong Clean Architecture

3️⃣ app/Domain

👉 Core business logic (quan trọng nhất)

app/Domain/
 ├─ User/
 │   ├─ Models/
 │   ├─ Repositories/
 │   ├─ DTOs/
 │   └─ Services/

🔹 Models

Entity

Không phụ thuộc HTTP

🔹 Repositories (interface)
interface UserRepositoryInterface

👉 Domain không biết Eloquent

🔹 Services

Business rule phức tạp

Không liên quan framework

4️⃣ app/Infrastructure

👉 Triển khai chi tiết kỹ thuật

app/Infrastructure/
 ├─ Persistence/
 │   └─ Eloquent/
 │       └─ UserRepository.php

Implements repository interface

Dùng Eloquent, DB, cache…

👉 Có thể đổi MySQL → Mongo không ảnh hưởng domain

5️⃣ app/Providers

👉 Bind interface → implementation

`$this->app->bind(
    UserRepositoryInterface::class,
    UserRepository::class
);`

👉 Dependency Injection chuẩn bài

6️⃣ routes/api.php

- Chỉ định tuyến

- Gọi controller

- Không logic

7️⃣ tests

👉 Test-first friendly

- Unit test domain

- Feature test API

- Mock repository dễ

8️⃣ database

- Migration

- Seeder

- Factory

👉 DB chỉ là infrastructure

🧠 Ví dụ luồng request (quan trọng)
POST /api/users
   ↓
Controller
   ↓
CreateUserAction
   ↓
UserDomainService
   ↓
UserRepositoryInterface
   ↓
EloquentUserRepository
   ↓
DB

👉 Mỗi tầng 1 trách nhiệm

🔥 Ưu điểm của kiến trúc này

✅ Code sạch
✅ Dễ test
✅ Dễ thay DB
✅ Team đông vẫn giữ được cấu trúc
✅ Rất hợp API lớn / lâu dài

⚠️ Nhược điểm

❌ Overkill cho project nhỏ
❌ Nhiều file
❌ Junior mới nhìn sẽ “choáng”

🧩 Khi nào nên dùng repo này?

✅ API cho mobile / frontend riêng
✅ SaaS
✅ Microservice
✅ Team > 2 người
❌ Website CRUD nhỏ

🧠 So nhanh với Laravel truyền thống với Repo này

- Controller to >< Controller mỏng
- Logic lẫn >< Logic tách
- Khó test >< Test dễ
- Nhanh ban đầu >< Chậm ban đầu
- Khó scale >< Scale tốt
🎯 Kết luận

👉 Repo này là Laravel API Starter Kit theo Clean Architecture
👉 Dành cho project nghiêm túc, lâu dài
👉 Rất đáng học nếu anh muốn backend level cao hơn
So sánh với Laravel Service Pattern

Mình so sánh Clean Architecture (repo api-starter-kit) với Laravel Service Pattern theo tư duy dev thực chiến, không lý thuyết khô nha.
🧠 Định nghĩa ngắn gọn
1️⃣ Laravel Service Pattern là gì?
Service Pattern = tách business logic ra khỏi Controller, cho vào Service class.
Ví dụ:
Controller → Service → Model
2️⃣ Clean Architecture (repo kia)
Tách hệ thống thành nhiều layer độc lập, domain không phụ thuộc framework.
Controller → Action → Domain → Repository Interface → Infrastructure
🧱 So sánh cấu trúc thư mục
🟢 Service Pattern
app/
 ├─ Http/Controllers
 ├─ Services/
 │   └─ UserService.php
 └─ Models/User.php

🔵 Clean Architecture
app/
 ├─ Http
 ├─ Actions
 ├─ Domain
 ├─ Infrastructure

🔍 So sánh chi tiết (quan trọng)
Tiêu chí Service Pattern Clean Architecture
Độ khó ⭐⭐ ⭐⭐⭐⭐
Số file Ít Nhiều
Học nhanh ✅ ❌
Test unit Trung bình Rất tốt
Domain độc lập ❌ ✅
Đổi DB Khó Dễ
Controller Mỏng Rất mỏng
DDD ❌ Gần DDD
🧪 Ví dụ cùng 1 use case: Create User
🟢 Service Pattern
`class UserService {
    public function create(array $data) {
        return User::create($data);
    }
}

class UserController {
    public function store(Request $request, UserService $service) {
        return $service->create($request->all());
    }
}`

👉 Service biết Eloquent, biết DB, biết HTTP context

🔵 Clean Architecture
`class CreateUserAction {
    public function execute(CreateUserDTO $dto) {
        $this->repo->save(
            User::createFromDTO($dto)
        );
    }
}`

👉 Action không biết DB, Domain không biết Laravel

🧠 Tư duy khác nhau ở đâu?
Service Pattern

Tư duy: “Tách bớt logic ra khỏi controller”

Phù hợp:

CRUD

App nhỏ → vừa

Dễ bị:

God Service

Service phình to

Clean Architecture

Tư duy: “Business là trung tâm”

Framework chỉ là tool

Dùng cho:

Domain phức tạp

API lớn

Team đông

⚠️ Nhược điểm thực tế
Service Pattern

❌ Service dễ to như controller
❌ Test phụ thuộc DB
❌ Khó enforce rule kiến trúc

Clean Architecture

❌ Boilerplate nhiều
❌ Code chậm ban đầu
❌ Junior dễ lạc

🎯 Khi nào dùng cái nào?
✅ Dùng Service Pattern nếu:

CRUD nhiều

Team nhỏ

Deadline gấp

Không cần DDD

✅ Dùng Clean Architecture nếu:

API core

Business rule phức tạp

Cần test nhiều

Product lâu dài

🔥 Cách chơi xịn ngoài đời

👉 Service Pattern nâng cấp

Controller
 → Action (Use Case)
   → Service
     → Repository

⚡ Ít phức tạp hơn Clean Architecture
⚡ Vẫn test ổn
⚡ Dễ áp dụng cho team Laravel

🧠 Kết luận chốt

Service Pattern = nhanh, thực dụng

Clean Architecture = lâu dài, chuẩn chỉnh

Không có cái nào “đúng tuyệt đối”

👉 Quan trọng là đúng với project & team

Nếu anh muốn:

Refactor 1 feature từ Service → Clean

Đánh giá project hiện tại nên theo hướng nào

Build skeleton riêng cho team anh

👉 em làm cùng anh được luôn 👍

DDD là gì?

Câu này là cột mốc tư duy của backend dev luôn đó 👍
Mình giải thích DDD (Domain-Driven Design) theo kiểu dev Laravel dễ nuốt, không học thuật nha.

🧠 DDD là gì? (nói thẳng)

DDD = Domain-Driven Design
👉 Là cách thiết kế phần mềm lấy nghiệp vụ (business) làm trung tâm, chứ không lấy DB hay framework làm trung tâm.

❌ “Làm sao lưu DB cho nhanh?”
✅ “Nghiệp vụ này vận hành như thế nào?”

🎯 Domain là gì?

Domain = bài toán nghiệp vụ

Ví dụ:

Thương mại điện tử

Blog

CMS

Kế toán

Booking

👉 DDD quan tâm:

Quy tắc

Luồng

Ràng buộc

Ngôn ngữ nghiệp vụ

🗣️ Ubiquitous Language (cực kỳ quan trọng)

DDD yêu cầu:

Dev

BA

PO

Client

👉 Dùng CHUNG 1 ngôn ngữ

Ví dụ:

❌ status = 2

✅ Order::markAsPaid()

🧱 Building Blocks của DDD (bản dev-friendly)
1️⃣ Entity

Có identity

Có lifecycle

`class Order {
    private OrderId $id;
}`

2️⃣ Value Object

Không có ID

Bất biến (immutable)

`class Money {
    public function __construct(
        public int $amount,
        public string $currency
    ) {}
}`

👉 Không có chuyện Money->amount = -100

3️⃣ Aggregate & Aggregate Root

👉 Group các entity
👉 Chỉ root được truy cập từ ngoài

Order (root)
 └─ OrderItem

4️⃣ Repository

👉 Interface để lưu / lấy aggregate

`interface OrderRepository {
    public function save(Order $order): void;
}`

❌ Không trả query builder
❌ Không lộ DB

5️⃣ Domain Service

👉 Logic nghiệp vụ không thuộc về 1 entity nào

`class PaymentService {
    public function pay(Order $order) {}
}`

6️⃣ Domain Event

👉 “Chuyện đã xảy ra trong domain”

OrderPaid
UserRegistered

🧠 DDD KHÔNG phải là gì

❌ Không phải framework
❌ Không phải folder name
❌ Không phải chỉ là “tạo nhiều class”

🧩 DDD vs MVC (Laravel)
MVC DDD
Model = DB Model = Business
Controller to Use case
Query-first Domain-first
🧪 Ví dụ Laravel thường vs DDD
❌ Laravel thường
Order::where('status', 1)->update(['status' => 2]);

✅ DDD-style
$order->markAsPaid();
$orderRepository->save($order);

⚠️ DDD có nhược điểm gì?

Nhiều code

Học lâu

Overkill cho CRUD

👉 DDD không dành cho mọi project

🎯 Khi nào NÊN dùng DDD?

✅ Domain phức tạp
✅ Business thay đổi nhiều
✅ Product sống lâu
✅ Team lớn

❌ CRUD admin
❌ App nhỏ
❌ Deadline gấp

🔥 DDD trong Laravel thực tế (khuyên dùng)

Không cần DDD “thuần khiết”, chỉ cần:

Tách Domain folder

Đặt tên theo nghiệp vụ

Dùng method thể hiện hành vi

Tránh logic trong Controller

👉 80% lợi ích với 30% công sức

🧠 Ví von cho dễ nhớ

MVC: “DB cần gì?”

DDD: “Business cần gì?”

Nếu anh muốn, em có thể:

Refactor 1 feature Laravel sang DDD-lite

Giải thích Aggregate Root bằng ví dụ e-commerce

Show cách DDD + Service Pattern

Hay DDD + Clean Architecture

👉 anh muốn đào sâu chỗ nào?

<https://github.com/hdeawy/api-starter-kit>
Laravel-SEO: <https://laravel-seo.com>
Laravel-Sitemap: <https://spatie.be/docs/laravel-sitemap/v1/introduction>
Laravel tagging:
<https://github.com/rtconner/laravel-tagging>
Hoặc docs chính thức:
<https://rtconner.github.io/laravel-tagging/>
Comment: tự dùng
