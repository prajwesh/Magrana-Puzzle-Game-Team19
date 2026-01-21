from django.db import models


class VocabWord(models.Model):
    anchor_word = models.CharField(max_length=128)

    class Meta:
        app_label = "hackathon_student"
        db_table = "vocab_words"
        managed = False
        default_auto_field = None
