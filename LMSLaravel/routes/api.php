<?php

use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CourseCategoryController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'status' => 'online',
        'message' => 'LMS API is running',
    ]);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->name('login');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('courses', CourseController::class)
        ->except(['index', 'show'])
        ->parameters(['courses' => 'id']);
    Route::apiResource(
        'categories',
        CourseCategoryController::class,
    )->parameters(['categories' => 'id']);
    Route::apiResource('users', UserController::class);
    Route::apiResource('enrollments', EnrollmentController::class);
    Route::apiResource('assignments', AssignmentController::class);
    Route::post('/assignments/{id}/submit', [AssignmentController::class, 'submit']);
    Route::post('/assignments/{id}/grade', [AssignmentController::class, 'grade']);

    Route::get('/reports/kpi', [ReportController::class, 'kpi']);
    Route::get('/reports/course-performance', [ReportController::class, 'coursePerformance']);
    Route::get('/reports/export', [ReportController::class, 'export']);
});

Route::apiResource('courses', CourseController::class)->only(['index', 'show'])->parameters(['courses' => 'id']);
