<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\DealController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserManagementController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('deals', DealController::class)->except(['show', 'create', 'edit']);
    
    Route::resource('products', ProductController::class)->except(['show', 'create', 'edit']);
    
    // Deal activities routes
    Route::post('deals/{deal}/todos', [DealController::class, 'storeTodo'])->name('deals.todos.store');
    Route::patch('deals/{deal}/todos/{todo}', [DealController::class, 'toggleTodo'])->name('deals.todos.toggle');
    Route::delete('deals/{deal}/todos/{todo}', [DealController::class, 'deleteTodo'])->name('deals.todos.delete');
    Route::post('deals/{deal}/comments', [DealController::class, 'storeComment'])->name('deals.comments.store');
    Route::delete('deals/{deal}/comments/{comment}', [DealController::class, 'deleteComment'])->name('deals.comments.delete');
    Route::post('deals/{deal}/messages', [DealController::class, 'storeMessage'])->name('deals.messages.store');
    Route::delete('deals/{deal}/messages/{message}', [DealController::class, 'deleteMessage'])->name('deals.messages.delete');

    // User Management routes (Super Admin only)
    Route::middleware('role:super admin')->group(function () {
        Route::resource('users', UserManagementController::class);
        Route::get('users/permissions/manage', [UserManagementController::class, 'permissions'])->name('users.permissions');
        Route::put('users/permissions/{role}', [UserManagementController::class, 'updatePermissions'])->name('users.permissions.update');
    });
});

require __DIR__.'/settings.php';
