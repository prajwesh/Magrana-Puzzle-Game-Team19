from django.core.management.base import BaseCommand
from hackathon.models import AppUser, AppUserMember


class Command(BaseCommand):
    help = "List all teams and their members"

    def add_arguments(self, parser):
        parser.add_argument(
            "--team",
            type=int,
            help="Show only specific team number",
        )
        parser.add_argument(
            "--show-all",
            action="store_true",
            help="Show all teams (default shows only Team 19 if it exists)",
        )

    def handle(self, *args, **options):
        specific_team = options.get("team")
        show_all = options.get("show_all")

        # Build query
        users_query = AppUser.objects.all()

        if specific_team:
            users_query = users_query.filter(team_no=specific_team)
            users = users_query.order_by("team_no")
        elif not show_all:
            # Default: show only Team 19 if it exists, otherwise show all
            team19 = users_query.filter(team_no=19).first()
            if team19:
                users = [team19]
                self.stdout.write(self.style.SUCCESS("=== YOUR TEAM (Team 19) ===\n"))
            else:
                users = users_query.order_by("team_no")
                self.stdout.write(
                    self.style.WARNING("Team 19 not found. Showing all teams.\n")
                )
        else:
            users = users_query.order_by("team_no")

        if not users:
            self.stdout.write(self.style.WARNING("No teams found in database."))
            return

        total_count = users_query.count()
        self.stdout.write(
            self.style.SUCCESS(f"Total teams in database: {total_count}\n")
        )

        for user in users:
            # Highlight Team 19
            if user.team_no == 19:
                self.stdout.write(self.style.SUCCESS("=" * 60))
                self.stdout.write(self.style.SUCCESS(f">>> TEAM 19 (YOUR TEAM) <<<"))
                self.stdout.write(self.style.SUCCESS("=" * 60))

            if user.team_no is None:
                self.stdout.write(
                    self.style.WARNING(f"Team (No team number assigned):")
                )
            else:
                self.stdout.write(self.style.SUCCESS(f"Team {user.team_no}:"))

            self.stdout.write(f"  Username: {user.username}")
            self.stdout.write(f'  Email: {user.email or "N/A"}')
            self.stdout.write(f'  Phone: {user.phone or "N/A"}')
            self.stdout.write(f"  Active: {user.is_active}")

            members = AppUserMember.objects.filter(user=user)
            self.stdout.write(f"  Members ({members.count()}):")
            for member in members:
                self.stdout.write(
                    f'    - {member.name} | {member.email or "N/A"} | {member.phone}'
                )

            # Show password format
            if user.team_no is not None:
                password = f"Team@{user.team_no:03d}"
                if user.team_no == 19:
                    self.stdout.write(self.style.SUCCESS(f"  ✓ Password: {password}"))
                else:
                    self.stdout.write(f"  Password: {password}")
            else:
                self.stdout.write(f"  Password: (Unknown - no team number)")

            if user.team_no == 19:
                self.stdout.write(self.style.SUCCESS("=" * 60))

            self.stdout.write("")

        # Summary
        teams_with_no = users_query.filter(team_no__isnull=False).count()
        teams_without_no = users_query.filter(team_no__isnull=True).count()
        team19_exists = users_query.filter(team_no=19).exists()

        self.stdout.write(self.style.SUCCESS(f"Summary:"))
        self.stdout.write(f"  Total teams: {total_count}")
        self.stdout.write(f"  Teams with team_no: {teams_with_no}")
        self.stdout.write(f"  Teams without team_no: {teams_without_no}")

        if team19_exists:
            self.stdout.write(self.style.SUCCESS(f"  ✓ Team 19 exists in database"))
        else:
            self.stdout.write(
                self.style.WARNING(f"  ✗ Team 19 NOT found - you need to import it!")
            )
            self.stdout.write("")
            self.stdout.write(
                "To add Team 19, create team19_only.csv with your team data and run:"
            )
            self.stdout.write(
                "  python manage.py import_teams --csv team19_only.csv --append-only"
            )
