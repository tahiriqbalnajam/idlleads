<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $products = Product::withCount(['deals' => function ($query) {
                // Only count active deals (not lost or closed)
                $query->whereNotIn('stage', ['deal-lost', 'close-deal']);
            }])
            ->with(['deals' => function ($query) {
                // Load recent active deals for each product
                $query->whereNotIn('stage', ['deal-lost', 'close-deal'])
                      ->with('user:id,name')
                      ->latest()
                      ->limit(3);
            }])
            ->latest()
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,
                    'deals_count' => $product->deals_count,
                    'recent_deals' => $product->deals->map(function ($deal) {
                        return [
                            'id' => $deal->id,
                            'client_name' => $deal->client_name,
                            'stage' => $deal->stage,
                            'value' => $deal->value,
                            'user' => $deal->user,
                            'created_at' => $deal->created_at,
                        ];
                    }),
                ];
            });

        return Inertia::render('products/index', [
            'products' => $products,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
        ]);

        $product = Product::create([
            'name' => $validated['name'],
            'price' => $validated['price'],
        ]);

        return redirect()->route('products.index')->with('success', 'Product created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
        ]);

        $product->update([
            'name' => $validated['name'],
            'price' => $validated['price'],
        ]);

        return redirect()->route('products.index')->with('success', 'Product updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->route('products.index')->with('success', 'Product deleted successfully.');
    }
}