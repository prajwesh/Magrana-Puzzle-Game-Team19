# hackathon/views_vocab.py
from django.http import JsonResponse
from django.db import connections
import random


def next_vocab_word(request):
    with connections["student"].cursor() as cursor:
        cursor.execute(
            """
            SELECT anchor_word
            FROM vocab_words
            ORDER BY RAND()
            LIMIT 1;

            """
        )
        row = cursor.fetchone()

    if not row:
        return JsonResponse({"detail": "No words found"}, status=404)

    anchor_word = row[0]

    return JsonResponse(
        {
            "anchor_word": anchor_word,
            "round_time_seconds": 60,
        }
    )
