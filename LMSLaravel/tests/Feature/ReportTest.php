<?php

use App\Models\User;

test('authenticated user can access report kpi metrics', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/reports/kpi');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'success',
            'message',
            'data' => [
                '*' => ['label', 'value', 'percentage', 'color'],
            ],
        ]);
});

test('authenticated user can access report course performance', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/reports/course-performance');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'success',
            'message',
            'data' => [
                '*' => ['id', 'name', 'progress', 'score', 'status', 'enrolled'],
            ],
        ]);
});

test('authenticated user can export report data', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/reports/export');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'success',
            'message',
            'data' => ['generated_at', 'filename', 'rows'],
        ]);
});
