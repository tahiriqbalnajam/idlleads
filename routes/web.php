<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\DealController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\WhatsAppController;
use App\Models\Deal;
use App\Models\Product;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        // Get deals assigned to the current authenticated user
        $deals = Deal::with(['assignedTo:id,name', 'product:id,name,price'])
            ->where('assigned_to', auth()->id())
            ->latest()
            ->get()
            ->map(function ($deal) {
                return [
                    'id' => $deal->id,
                    'clientName' => $deal->client_name,
                    'phoneNumber' => $deal->phone_number,
                    'stage' => $deal->stage,
                    'priority' => $deal->priority,
                    'value' => $deal->value,
                    'assignedTo' => $deal->assignedTo ? [
                        'id' => $deal->assignedTo->id,
                        'name' => $deal->assignedTo->name,
                    ] : null,
                    'product' => $deal->product ? [
                        'id' => $deal->product->id,
                        'name' => $deal->product->name,
                        'price' => $deal->product->price,
                    ] : null,
                    'created_at' => $deal->created_at,
                    'updated_at' => $deal->updated_at,
                ];
            });

        // Get products that have deals assigned to current user
        $products = Product::whereHas('deals', function ($query) {
                $query->where('assigned_to', auth()->id());
            })
            ->withCount(['deals' => function ($query) {
                $query->where('assigned_to', auth()->id());
            }])
            ->with(['deals' => function ($query) {
                $query->where('assigned_to', auth()->id())
                      ->latest();
            }])
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'deals_count' => $product->deals_count,
                    'deals' => $product->deals->map(function ($deal) {
                        return [
                            'id' => $deal->id,
                            'client_name' => $deal->client_name,
                            'phone_number' => $deal->phone_number,
                            'stage' => $deal->stage,
                            'priority' => $deal->priority,
                            'value' => $deal->value,
                            'created_at' => $deal->created_at,
                        ];
                    }),
                ];
            });

        return Inertia::render('dashboard', [
            'deals' => $deals,
            'products' => $products,
        ]);
    })->name('dashboard');

    Route::resource('deals', DealController::class)->except(['show', 'create', 'edit']);
    
    Route::resource('products', ProductController::class)->except(['show', 'create', 'edit']);
    
    // WhatsApp routes
    Route::get('whatsapp', [WhatsAppController::class, 'index'])->name('whatsapp');
    Route::get('whatsapp/status', [WhatsAppController::class, 'status'])->name('whatsapp.status');
    Route::post('whatsapp/send-message', [WhatsAppController::class, 'sendMessage'])->name('whatsapp.send-message');
    Route::post('whatsapp/send-media', [WhatsAppController::class, 'sendMedia'])->name('whatsapp.send-media');
    Route::get('whatsapp/chats', [WhatsAppController::class, 'getChats'])->name('whatsapp.chats');
    Route::get('whatsapp/messages/{jid}', [WhatsAppController::class, 'getMessages'])->name('whatsapp.messages');
    Route::post('whatsapp/request-pairing-code', [WhatsAppController::class, 'requestPairingCode'])->name('whatsapp.pairing-code');
    Route::post('whatsapp/logout', [WhatsAppController::class, 'logout'])->name('whatsapp.logout');
    Route::post('whatsapp/check-number', [WhatsAppController::class, 'checkNumber'])->name('whatsapp.check-number');
    
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
