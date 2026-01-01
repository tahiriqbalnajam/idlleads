<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class WhatsAppController extends Controller
{
    private $whatsappServiceUrl = 'http://localhost:3001';

    public function index()
    {
        return Inertia::render('whatsapp/index');
    }

    public function status()
    {
        try {
            $response = Http::get("{$this->whatsappServiceUrl}/status");
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Could not connect to WhatsApp service',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function sendMessage(Request $request)
    {
        $request->validate([
            'jid' => 'required|string',
            'message' => 'required|string',
        ]);

        try {
            $response = Http::post("{$this->whatsappServiceUrl}/send-message", [
                'jid' => $request->jid,
                'message' => $request->message,
            ]);

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to send message',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function sendMedia(Request $request)
    {
        $request->validate([
            'jid' => 'required|string',
            'url' => 'required|url',
            'type' => 'required|in:image,video,audio,document',
            'caption' => 'nullable|string',
        ]);

        try {
            $response = Http::post("{$this->whatsappServiceUrl}/send-media", [
                'jid' => $request->jid,
                'url' => $request->url,
                'type' => $request->type,
                'caption' => $request->caption,
            ]);

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to send media',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getChats()
    {
        try {
            $response = Http::get("{$this->whatsappServiceUrl}/chats");
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to get chats',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getMessages($jid)
    {
        try {
            $response = Http::get("{$this->whatsappServiceUrl}/messages/{$jid}");
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to get messages',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function requestPairingCode(Request $request)
    {
        $request->validate([
            'phoneNumber' => 'required|string',
        ]);

        try {
            $response = Http::post("{$this->whatsappServiceUrl}/request-pairing-code", [
                'phoneNumber' => $request->phoneNumber,
            ]);

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to request pairing code',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function logout()
    {
        try {
            $response = Http::post("{$this->whatsappServiceUrl}/logout");
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to logout',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function checkNumber(Request $request)
    {
        $request->validate([
            'phoneNumber' => 'required|string',
        ]);

        try {
            $response = Http::post("{$this->whatsappServiceUrl}/check-number", [
                'phoneNumber' => $request->phoneNumber,
            ]);

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to check number',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
