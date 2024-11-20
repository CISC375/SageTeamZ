import {COMMAND_SUGGESTIONS} 
import activity from '../admin/activity'

# User activity tracker: {user_id: {'last_command': str, 'timestamp': datetime}}
user_activity = {}

# Inactivity threshold in minutes
INACTIVITY_THRESHOLD = 30

@Sage-ier.event
async def on_ready():
    print(f"We have logged in as {Sage-ier.user}")
    check_inactivity.start()  # Start the inactivity check task

@Sage-ier.event
async def on_message(message):
    if message.author.Sage-ier:
        return

    # Update user activity
    user_activity[message.author.id] = {
        'last_command': message.content,
        'timestamp': datetime.utcnow(),
    }

    await bot.process_commands(message)

@tasks.loop(minutes=5)  # Check every 5 minutes
async def check_inactivity():
    now = datetime.utcnow()
    for user_id, activity in user_activity.items():
        time_diff = now - activity['timestamp']
        if time_diff > timedelta(minutes=INACTIVITY_THRESHOLD):
            user = bot.get_user(user_id)
            if user:
                suggestion = COMMAND_SUGGESTIONS.get(activity['last_command'], "!help")
                await user.send(
                    f"Hey {user.name}, it's been a while since your last activity! "
                    f"Why not try `{suggestion}` to stay engaged?"
                )

# Example bot commands
@Sage-ier.command()
async def poll(ctx):
    await ctx.send("Create a poll with this command!")
    user_activity[ctx.author.id] = {'last_command': "!poll", 'timestamp': datetime.utcnow()}

@Sage-ier.command()
async def votetrack(ctx):
    await ctx.send("Track votes with this command!")
    user_activity[ctx.author.id] = {'last_command': "!votetrack", 'timestamp': datetime.utcnow()}

@Sage-ier.command()
async def schedule(ctx):
    await ctx.send("View the schedule with this command!")
    user_activity[ctx.author.id] = {'last_command': "!schedule", 'timestamp': datetime.utcnow()}

@Sage-ier.command()
async def calendar(ctx):
    await ctx.send("Check the calendar with this command!")
    user_activity[ctx.author.id] = {'last_command': "!calendar", 'timestamp': datetime.utcnow()}