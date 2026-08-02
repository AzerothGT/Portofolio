<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\ApiResponse;
use App\Http\Resources\AssignmentResource;
use App\Models\Assignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Assignment::query();

        if ($search = $request->query('search')) {
            $query->where('title', 'like', "%{$search}%")
                ->orWhere('course_title', 'like', "%{$search}%");
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($courseId = $request->query('course_id')) {
            $query->where('course_id', $courseId);
        }

        $assignments = AssignmentResource::collection($query->latest()->get());

        return $this->collectionResponse($assignments, 'Data tugas berhasil diambil');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'course_title' => 'required|string|max:255',
            'course_id' => 'nullable|exists:courses,id',
            'due_date' => 'required|date',
            'max_points' => 'required|integer|min:1',
            'instructions' => 'required|string',
            'status' => 'sometimes|in:PENDING,SUBMITTED,GRADED',
        ]);

        $validated['status'] = $validated['status'] ?? 'PENDING';

        $assignment = Assignment::create($validated);

        return $this->created(
            new AssignmentResource($assignment),
            'Tugas berhasil dibuat'
        );
    }

    public function show($id): JsonResponse
    {
        $assignment = Assignment::findOrFail($id);

        return $this->resourceResponse(
            new AssignmentResource($assignment),
            'Data tugas berhasil diambil'
        );
    }

    public function update(Request $request, $id): JsonResponse
    {
        $assignment = Assignment::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'course_title' => 'sometimes|string|max:255',
            'course_id' => 'nullable|exists:courses,id',
            'due_date' => 'sometimes|date',
            'max_points' => 'sometimes|integer|min:1',
            'instructions' => 'sometimes|string',
            'status' => 'sometimes|in:PENDING,SUBMITTED,GRADED',
            'grade' => 'nullable|integer|min:0',
            'submission' => 'nullable|string',
        ]);

        $assignment->update($validated);

        return $this->resourceResponse(
            new AssignmentResource($assignment),
            'Tugas berhasil diperbarui'
        );
    }

    public function submit(Request $request, $id): JsonResponse
    {
        $assignment = Assignment::findOrFail($id);

        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $assignment->update([
            'status' => 'SUBMITTED',
            'submission' => $validated['content'],
        ]);

        return $this->resourceResponse(
            new AssignmentResource($assignment),
            'Tugas berhasil dikirimkan'
        );
    }

    public function grade(Request $request, $id): JsonResponse
    {
        $assignment = Assignment::findOrFail($id);

        $validated = $request->validate([
            'grade' => 'required|integer|min:0|max:'.($assignment->max_points ?? 100),
        ]);

        $assignment->update([
            'status' => 'GRADED',
            'grade' => $validated['grade'],
        ]);

        return $this->resourceResponse(
            new AssignmentResource($assignment),
            'Tugas berhasil dinilai'
        );
    }

    public function destroy($id): JsonResponse
    {
        $assignment = Assignment::findOrFail($id);
        $assignment->delete();

        return $this->success(null, 'Tugas berhasil dihapus');
    }
}
