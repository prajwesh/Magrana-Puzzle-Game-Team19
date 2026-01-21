from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone
from django.db import connections
from datetime import datetime
from datetime import datetime
from pytz import timezone as pytz_timezone

# Set your desired timezone, e.g., Asia/Kolkata
india_time = datetime.now(pytz_timezone('Asia/Kolkata'))

@api_view(["POST"])
@permission_classes([AllowAny])
def save_game_results(request):
    """
    Save game results to database - NO MODEL NEEDED
    Uses raw SQL to insert into team19.game_results
    Uses 'student' database connection

    Expected JSON:
    {
        "user_id": 1,
        "total_score": 5.3,
        "total_time_spent": 120,
        "tasks_completed": 2
    }
    """
    try:
        # Get data from request
        user_id = request.data.get("user_id")
        total_score = request.data.get("total_score")
        total_time_spent = request.data.get("total_time_spent")
        tasks_completed = request.data.get("tasks_completed")

        # Validation - allow 0 values, just check for None
        if (
            user_id is None
            or total_score is None
            or total_time_spent is None
            or tasks_completed is None
        ):
            return Response(
                {
                    "success": False,
                    "message": "Missing required fields: user_id, total_score, total_time_spent, tasks_completed",
                    "received": {
                        "user_id": user_id,
                        "total_score": total_score,
                        "total_time_spent": total_time_spent,
                        "tasks_completed": tasks_completed,
                    },
                },
                status=400,
            )

        # Convert to proper types
        user_id = int(user_id)
        total_score = float(total_score)
        total_time_spent = int(total_time_spent)
        tasks_completed = int(tasks_completed)

        # Insert into database using raw SQL (team19 schema)
        # Use 'student' database connection instead of default
        with connections["student"].cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO team19.game_results 
                (user_id, total_score, total_time_spent, tasks_completed, created_at)
                VALUES (%s, %s, %s, %s, %s)
            """,
                [
                    user_id,
                    total_score,
                    total_time_spent,
                    tasks_completed,
                    india_time,
                ],
            )

        return Response(
            {
                "success": True,
                "message": "Game results saved successfully",
                "data": {
                    "user_id": user_id,
                    "total_score": total_score,
                    "total_time_spent": total_time_spent,
                    "tasks_completed": tasks_completed,
                },
            },
            status=201,
        )

    except ValueError as e:
        return Response(
            {"success": False, "message": f"Invalid data type: {str(e)}"}, status=400
        )
    except Exception as e:
        print(f"Error saving game results: {str(e)}")
        return Response({"success": False, "message": f"Error: {str(e)}"}, status=500)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_user_game_results(request, user_id):
    """
    Get all game results for a specific user
    Uses 'student' database connection
    """
    try:
        with connections["student"].cursor() as cursor:
            cursor.execute(
                """
                SELECT id, user_id, total_score, total_time_spent, 
                       tasks_completed, created_at
                FROM team19.game_results
                WHERE user_id = %s
                ORDER BY created_at DESC
            """,
                [user_id],
            )

            columns = [col[0] for col in cursor.description]
            results = []

            for row in cursor.fetchall():
                results.append(dict(zip(columns, row)))

        return Response({"success": True, "data": results, "count": len(results)})

    except Exception as e:
        return Response({"success": False, "message": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_game_stats(request, user_id):
    """
    Get aggregated stats for a user
    Uses 'student' database connection
    """
    try:
        with connections["student"].cursor() as cursor:
            cursor.execute(
                """
                SELECT 
                    COUNT(*) as total_games,
                    AVG(total_score) as avg_score,
                    MAX(total_score) as best_score,
                    SUM(total_time_spent) as total_time,
                    SUM(tasks_completed) as total_tasks
                FROM team19.game_results
                WHERE user_id = %s
            """,
                [user_id],
            )

            columns = [col[0] for col in cursor.description]
            row = cursor.fetchone()
            stats = dict(zip(columns, row))

        return Response({"success": True, "data": stats})

    except Exception as e:
        return Response({"success": False, "message": str(e)}, status=500)
