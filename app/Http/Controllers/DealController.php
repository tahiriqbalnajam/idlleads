<?php

namespace App\Http\Controllers;

use App\Models\Deal;
use App\Models\User;
use App\Models\Product;
use App\Models\DealTodo;
use App\Models\DealComment;
use App\Models\DealMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DealController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $filterUsers = $request->input('users', [auth()->id()]);
        
        $query = Deal::with([
                'todos',
                'assignedTo:id,name',
                'product:id,name,price',
                'comments' => function ($query) {
                    $query->latest();
                },
                'messages' => function ($query) {
                    $query->latest();
                }
            ])
            ->where('user_id', auth()->id());

        // Apply user filter if specific users are selected
        if (!empty($filterUsers) && !in_array('all', $filterUsers)) {
            $query->where(function($q) use ($filterUsers) {
                $q->whereIn('assigned_to', $filterUsers)
                  ->orWhereNull('assigned_to');
            });
        }

        $deals = $query->latest()
            ->get()
            ->map(function ($deal) {
                return [
                    'id' => $deal->id,
                    'clientName' => $deal->client_name,
                    'phoneNumber' => $deal->phone_number,
                    'stage' => $deal->stage,
                    'priority' => $deal->priority,
                    'value' => $deal->value,
                    'notes' => $deal->notes,
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
                    'todos' => $deal->todos,
                    'comments' => $deal->comments,
                    'messages' => $deal->messages,
                ];
            });

        $users = User::select('id', 'name')->get();
        $products = Product::select('id', 'name', 'price')->get();

        return Inertia::render('deals/index', [
            'deals' => $deals,
            'users' => $users,
            'products' => $products,
            'filters' => [
                'users' => $filterUsers,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'clientName' => 'required|string|max:255',
            'phoneNumber' => 'nullable|string|regex:/^[1-9][0-9]{9}$/',
            'stage' => 'required|in:new,call,in-progress,meeting,deal-lost,close-deal',
            'priority' => 'required|in:low,medium,high',
            'assignedTo' => 'nullable|exists:users,id',
            'productId' => 'nullable|exists:products,id',
            'value' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'todos' => 'nullable|array',
            'todos.*.text' => 'required|string',
            'todos.*.due_date' => 'nullable|date',
            'todos.*.priority' => 'nullable|integer',
            'comments' => 'nullable|array',
            'comments.*.text' => 'required|string',
            'messages' => 'nullable|array',
            'messages.*.text' => 'required|string',
        ]);

        DB::beginTransaction();
        try {
            $deal = Deal::create([
                'user_id' => auth()->id(),
                'assigned_to' => $validated['assignedTo'] ?? null,
                'product_id' => $validated['productId'] ?? null,
                'client_name' => $validated['clientName'],
                'phone_number' => isset($validated['phoneNumber']) ? '+92' . $validated['phoneNumber'] : null,
                'stage' => $validated['stage'],
                'priority' => $validated['priority'],
                'value' => $validated['value'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            // Create todos if provided
            if (!empty($validated['todos'])) {
                foreach ($validated['todos'] as $todo) {
                    $deal->todos()->create([
                        'text' => $todo['text'],
                        'due_date' => $todo['due_date'] ?? null,
                        'priority' => $todo['priority'] ?? 0,
                    ]);
                }
            }

            // Create comments if provided
            if (!empty($validated['comments'])) {
                foreach ($validated['comments'] as $comment) {
                    $deal->comments()->create([
                        'user_id' => auth()->id(),
                        'text' => $comment['text'],
                    ]);
                }
            }

            // Create messages if provided
            if (!empty($validated['messages'])) {
                foreach ($validated['messages'] as $message) {
                    $deal->messages()->create([
                        'user_id' => auth()->id(),
                        'text' => $message['text'],
                        'status' => 'pending',
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('deals')->with('success', 'Deal created successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create deal: ' . $e->getMessage()]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Deal $deal)
    {
        // Ensure user owns the deal
        if ($deal->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'clientName' => 'sometimes|required|string|max:255',
            'phoneNumber' => 'nullable|string|regex:/^[1-9][0-9]{9}$/',
            'stage' => 'sometimes|required|in:new,call,in-progress,meeting,deal-lost,close-deal',
            'priority' => 'sometimes|required|in:low,medium,high',
            'assignedTo' => 'nullable|exists:users,id',
            'productId' => 'nullable|exists:products,id',
            'value' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'todos' => 'nullable|array',
            'todos.*.id' => 'nullable|integer',
            'todos.*.text' => 'sometimes|required|string',
            'todos.*.completed' => 'nullable|boolean',
            'todos.*.due_date' => 'nullable|date',
            'comments' => 'nullable|array',
            'comments.*.text' => 'sometimes|required|string',
            'messages' => 'nullable|array',
            'messages.*.text' => 'sometimes|required|string',
        ]);

        DB::beginTransaction();
        try {
            $updateData = [];
            
            if (isset($validated['clientName'])) {
                $updateData['client_name'] = $validated['clientName'];
            }
            
            if (isset($validated['phoneNumber'])) {
                $updateData['phone_number'] = '+92' . $validated['phoneNumber'];
            }
            
            if (isset($validated['stage'])) {
                $updateData['stage'] = $validated['stage'];
            }
            
            if (isset($validated['priority'])) {
                $updateData['priority'] = $validated['priority'];
            }
            
            if (array_key_exists('assignedTo', $validated)) {
                $updateData['assigned_to'] = $validated['assignedTo'];
            }
            
            if (array_key_exists('productId', $validated)) {
                $updateData['product_id'] = $validated['productId'];
            }
            
            if (isset($validated['value'])) {
                $updateData['value'] = $validated['value'];
            }
            
            if (isset($validated['notes'])) {
                $updateData['notes'] = $validated['notes'];
            }
            
            $deal->update($updateData);

            // Sync todos (simple approach: delete and recreate)
            if (isset($validated['todos'])) {
                $deal->todos()->delete();
                foreach ($validated['todos'] as $todo) {
                    $deal->todos()->create([
                        'text' => $todo['text'],
                        'completed' => $todo['completed'] ?? false,
                        'due_date' => $todo['due_date'] ?? null,
                    ]);
                }
            }

            // Add new comments (don't delete existing)
            if (!empty($validated['comments'])) {
                foreach ($validated['comments'] as $comment) {
                    $deal->comments()->create([
                        'user_id' => auth()->id(),
                        'text' => $comment['text'],
                    ]);
                }
            }

            // Add new messages (don't delete existing)
            if (!empty($validated['messages'])) {
                foreach ($validated['messages'] as $message) {
                    $deal->messages()->create([
                        'user_id' => auth()->id(),
                        'text' => $message['text'],
                        'status' => 'pending',
                    ]);
                }
            }

            DB::commit();

            // Return Inertia response instead of redirect for AJAX requests
            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return back();
            }

            return redirect()->route('deals.index')->with('success', 'Deal updated successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update deal: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Deal $deal)
    {
        // Ensure user owns the deal
        if ($deal->user_id !== auth()->id()) {
            abort(403);
        }

        $deal->delete();

        return redirect()->route('deals')->with('success', 'Deal deleted successfully!');
    }

    /**
     * Store a new todo for a deal.
     */
    public function storeTodo(Request $request, Deal $deal)
    {
        // Ensure user owns the deal
        if ($deal->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'text' => 'required|string',
            'due_date' => 'nullable|date',
            'due_time' => 'nullable|string',
            'completed' => 'nullable|boolean',
        ]);

        $todo = $deal->todos()->create([
            'text' => $validated['text'],
            'due_date' => $validated['due_date'] ?? null,
            'due_time' => $validated['due_time'] ?? null,
            'completed' => $validated['completed'] ?? false,
        ]);

        return back();
    }

    /**
     * Toggle a todo's completed status.
     */
    public function toggleTodo(Deal $deal, DealTodo $todo)
    {
        // Ensure user owns the deal and todo belongs to deal
        if ($deal->user_id !== auth()->id() || $todo->deal_id !== $deal->id) {
            abort(403);
        }

        $todo->update(['completed' => !$todo->completed]);

        return back();
    }

    /**
     * Delete a todo.
     */
    public function deleteTodo(Deal $deal, DealTodo $todo)
    {
        // Ensure user owns the deal and todo belongs to deal
        if ($deal->user_id !== auth()->id() || $todo->deal_id !== $deal->id) {
            abort(403);
        }

        $todo->delete();

        return back();
    }

    /**
     * Store a new comment for a deal.
     */
    public function storeComment(Request $request, Deal $deal)
    {
        // Ensure user owns the deal
        if ($deal->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'text' => 'required|string',
        ]);

        $comment = $deal->comments()->create([
            'user_id' => auth()->id(),
            'text' => $validated['text'],
        ]);

        return back();
    }

    /**
     * Delete a comment.
     */
    public function deleteComment(Deal $deal, DealComment $comment)
    {
        // Ensure user owns the deal and comment belongs to deal
        if ($deal->user_id !== auth()->id() || $comment->deal_id !== $deal->id) {
            abort(403);
        }

        $comment->delete();

        return back();
    }

    /**
     * Store a new message for a deal.
     */
    public function storeMessage(Request $request, Deal $deal)
    {
        // Ensure user owns the deal
        if ($deal->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'text' => 'required|string',
        ]);

        $message = $deal->messages()->create([
            'user_id' => auth()->id(),
            'text' => $validated['text'],
            'status' => 'pending',
        ]);

        return back();
    }

    /**
     * Delete a message.
     */
    public function deleteMessage(Deal $deal, DealMessage $message)
    {
        // Ensure user owns the deal and message belongs to deal
        if ($deal->user_id !== auth()->id() || $message->deal_id !== $deal->id) {
            abort(403);
        }

        $message->delete();

        return back();
    }
}
