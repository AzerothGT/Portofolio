<?php

use App\Models\Assignment;
use App\Models\User;

test('authenticated user can list assignments', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/assignments');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'success',
            'message',
            'data',
        ]);
});

test('authenticated user can submit assignment work', function () {
    $user = User::factory()->create();
    $assignment = Assignment::create([
        'title' => 'Test Assignment',
        'course_title' => 'Laravel Masterclass',
        'due_date' => now()->addDays(7)->format('Y-m-d'),
        'max_points' => 100,
        'instructions' => 'Complete the tasks',
        'status' => 'PENDING',
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->postJson("/api/assignments/{$assignment->id}/submit", [
            'content' => 'https://github.com/example/submission',
        ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.status', 'SUBMITTED')
        ->assertJsonPath('data.submission', 'https://github.com/example/submission');
});

test('instructor can grade assignment', function () {
    $user = User::factory()->create(['role' => 'instructor']);
    $assignment = Assignment::create([
        'title' => 'Test Assignment 2',
        'course_title' => 'Laravel Masterclass',
        'due_date' => now()->addDays(7)->format('Y-m-d'),
        'max_points' => 100,
        'instructions' => 'Complete the tasks',
        'status' => 'SUBMITTED',
        'submission' => 'My Work Content',
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->postJson("/api/assignments/{$assignment->id}/grade", [
            'grade' => 95,
        ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.status', 'GRADED')
        ->assertJsonPath('data.grade', 95);
});
