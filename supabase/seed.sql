-- Pocket Dates — seed / demo activities
-- Idempotent: safe to re-run any time — upserts by title (for is_seed
-- rows), so editing a row here and re-running updates it in place rather
-- than skipping it.

insert into public.activities
  (title, description, duration_category, estimated_minutes, activity_type, indoor_outdoor, is_at_home, is_seed, interests, date_styles, image_url, emoji)
values
  -- ---------------------------------------------------------------------
  -- Under 30 minutes
  -- ---------------------------------------------------------------------
  ('Sunset & Bubble Tea', 'Grab your favourite drink and find somewhere pretty to watch the sky change.', 'under_30', 25, 'bubble_tea', 'outdoor', false, true, array['food','coffee','exploring'], array['cozy','romantic','spontaneous'], null, '🧋'),
  ('Coffee & People-Watching', 'Find a window seat at a cosy café and make up stories about passers-by.', 'under_30', 25, 'coffee', 'indoor', false, true, array['coffee','exploring'], array['cozy','simple'], null, '☕'),
  ('Five-Minute Compliment Game', 'Take turns saying one thing you love about each other until the timer runs out.', 'under_30', 10, 'questions', 'indoor', true, true, array['staying_home'], array['romantic','simple','cozy'], null, '💛'),
  ('Blind Taste Test', 'Blindfold each other and guess snacks, drinks, or spices from the pantry.', 'under_30', 20, 'taste_test', 'indoor', true, true, array['food','cooking'], array['creative','spontaneous'], null, '🙈'),
  ('Make a Shared Playlist', 'Each add five songs that remind you of each other — no skipping allowed.', 'under_30', 20, 'playlist', 'indoor', true, true, array['music'], array['cozy','creative','simple'], null, '🎵'),
  ('Neighbourhood Dessert Run', 'Walk to the nearest bakery or dessert spot and split something sweet.', 'under_30', 25, 'dessert', 'outdoor', false, true, array['food','exploring'], array['foodie','simple','spontaneous'], null, '🍰'),
  ('Quick Bookshop Browse', 'Duck into a bookshop and each pick a book you think the other should read.', 'under_30', 25, 'bookshop', 'indoor', false, true, array['books','exploring'], array['cozy','simple'], null, '📚'),
  ('Two-Song Dance Party', 'Clear a bit of floor and dance to two songs, no rules, no judgement.', 'under_30', 10, 'music', 'indoor', true, true, array['music','staying_home'], array['spontaneous','creative'], null, '💃'),
  ('Golden-Hour Balcony Sit', 'Bring drinks outside — a balcony, stoop, or garden — and just sit together.', 'under_30', 20, 'walk', 'outdoor', true, true, array['nature','staying_home'], array['cozy','romantic','simple'], null, '🌇'),

  -- ---------------------------------------------------------------------
  -- 1–2 hours
  -- ---------------------------------------------------------------------
  ('Scenic Sunset Walk', 'Find the prettiest route nearby and watch the sky change together.', '1_2_hours', 60, 'walk', 'outdoor', false, true, array['nature','exploring','photography'], array['romantic','outdoors','simple'], null, '🌅'),
  ('Cook Something You''ve Never Made', 'Pick a recipe neither of you has tried and cook it together from scratch.', '1_2_hours', 90, 'cooking', 'indoor', true, true, array['cooking','food'], array['cozy','foodie','creative'], null, '🍳'),
  ('Bookshop & Coffee Afternoon', 'Browse a bookshop, then settle in nearby with drinks and your finds.', '1_2_hours', 90, 'bookshop', 'indoor', false, true, array['books','coffee'], array['cozy','simple'], null, '📖'),
  ('Arcade Rematch', 'Best of five games, loser buys the next round of drinks.', '1_2_hours', 75, 'arcade', 'indoor', false, true, array['gaming'], array['adventurous','spontaneous'], null, '🕹️'),
  ('Museum Wander', 'Pick one wing of a local museum and really take your time with it.', '1_2_hours', 90, 'museum', 'indoor', false, true, array['museums','arts_crafts'], array['creative','simple'], null, '🖼️'),
  ('Build a Lego Set Together', 'Pick a small set and build it side by side, no instructions-hogging.', '1_2_hours', 90, 'lego', 'indoor', true, true, array['gaming','arts_crafts'], array['cozy','creative'], null, '🧱'),
  ('Park Picnic', 'Pack snacks, grab a blanket, and claim a good patch of grass.', '1_2_hours', 90, 'park', 'outdoor', false, true, array['nature','food'], array['cozy','outdoors','romantic'], null, '🧺'),
  ('Phone-Free Dinner', 'Cook or order in, phones in another room, just conversation.', '1_2_hours', 75, 'dinner', 'indoor', true, true, array['food','staying_home'], array['romantic','simple','cozy'], null, '🍽️'),
  ('Bake Something From Scratch', 'Pick something neither of you has baked and make a mess trying.', '1_2_hours', 100, 'baking', 'indoor', true, true, array['cooking','food'], array['cozy','foodie','creative'], null, '🧁'),
  ('Couples Question Challenge', 'Work through a deck of deep-talk questions, one drink per round.', '1_2_hours', 60, 'questions', 'indoor', true, true, array['staying_home'], array['romantic','cozy','creative'], null, '💬'),
  ('Mini Spa Evening', 'Face masks, warm towels, and a playlist — pamper each other at home.', '1_2_hours', 75, 'spa', 'indoor', true, true, array['staying_home'], array['cozy','romantic','simple'], null, '🕯️'),
  ('Cinema Matinee', 'Catch an early showing and debate it over the drink afterwards.', '1_2_hours', 120, 'cinema', 'indoor', false, true, array['films'], array['simple','romantic'], null, '🎬'),
  ('Local Attraction Visit', 'Finally go see that landmark or attraction you keep saying you will.', '1_2_hours', 90, 'attraction', 'either', false, true, array['exploring','photography'], array['adventurous','simple'], null, '🗺️'),
  ('Watch a Film Neither of You Has Seen', 'Pick blind from a shortlist and commit, no scrolling for an hour.', '1_2_hours', 110, 'movie_night', 'indoor', true, true, array['films','staying_home'], array['cozy','simple'], null, '🍿'),
  ('Thrift Store Treasure Hunt', 'Give each other five minutes to find the other the best/worst outfit.', '1_2_hours', 60, 'shopping', 'indoor', false, true, array['shopping','arts_crafts'], array['creative','spontaneous'], null, '👗'),

  -- ---------------------------------------------------------------------
  -- 3+ hours
  -- ---------------------------------------------------------------------
  ('Day Trip Somewhere New', 'Pick a town or neighbourhood neither of you has explored and wander it.', '3_plus_hours', 240, 'exploring', 'outdoor', false, true, array['exploring','nature','photography'], array['adventurous','outdoors','spontaneous'], null, '🚗'),
  ('Recreate Your First Date', 'Go back to where it started, or recreate it as closely as you can at home.', '3_plus_hours', 180, 'recreate_date', 'either', true, true, array['staying_home'], array['romantic','cozy','creative'], null, '💞'),
  ('Cook a Full Tasting Menu', 'Plan and cook a multi-course meal together, one course each.', '3_plus_hours', 210, 'cooking', 'indoor', true, true, array['cooking','food'], array['foodie','creative','romantic'], null, '👩‍🍳'),
  ('Hike & Picnic', 'Find a trail with a view, pack a lunch, and make a full afternoon of it.', '3_plus_hours', 240, 'nature', 'outdoor', false, true, array['nature','fitness'], array['adventurous','outdoors'], null, '🥾'),
  ('Museum + Long Lunch', 'A full museum visit followed by an unhurried lunch to talk it over.', '3_plus_hours', 240, 'museum', 'either', false, true, array['museums','food'], array['creative','foodie','simple'], null, '🏛️'),
  ('At-Home Film Festival', 'Three films, one theme, homemade snacks between each.', '3_plus_hours', 300, 'movie_night', 'indoor', true, true, array['films','staying_home'], array['cozy','simple'], null, '🎞️'),
  ('Weekend Market Morning', 'Wander a farmers or flea market, taste everything, buy something small.', '3_plus_hours', 180, 'exploring', 'outdoor', false, true, array['food','shopping','exploring'], array['foodie','simple','spontaneous'], null, '🥕'),
  ('Photography Walk', 'Bring a camera or just your phones and document the day, one photo an hour.', '3_plus_hours', 180, 'photography', 'outdoor', false, true, array['photography','exploring','nature'], array['creative','outdoors'], null, '📸'),
  ('Amusement or Water Park Day', 'Go all in on rides, games, or slides until you''re both worn out.', '3_plus_hours', 300, 'attraction', 'outdoor', false, true, array['exploring','fitness'], array['adventurous','spontaneous'], null, '🎢'),
  ('Crafting Afternoon', 'Pick a craft kit — painting, pottery, embroidery — and get messy together.', '3_plus_hours', 200, 'crafts', 'indoor', true, true, array['arts_crafts','creative'], array['cozy','creative'], null, '🎨'),

  -- ---------------------------------------------------------------------
  -- Generic "go find one nearby" prompts (used when Places API/location is
  -- unavailable, or blended with live results when it is)
  -- ---------------------------------------------------------------------
  ('Find a Cosy Coffee Shop', 'Search out a coffee shop you haven''t tried and claim a corner table.', 'under_30', 30, 'coffee', 'indoor', false, true, array['coffee'], array['cozy','simple'], null, '☕'),
  ('Find a Bubble Tea Spot', 'Track down a bubble tea place and try a flavour you''ve never had.', 'under_30', 25, 'bubble_tea', 'indoor', false, true, array['food'], array['cozy','spontaneous'], null, '🧋'),
  ('Find a Park to Wander', 'Head to the nearest green space and just walk until you feel like turning back.', '1_2_hours', 60, 'park', 'outdoor', false, true, array['nature'], array['outdoors','simple'], null, '🌳'),
  ('Find a New Restaurant', 'Pick a cuisine you rarely order and find somewhere new to try it.', '1_2_hours', 90, 'restaurant', 'indoor', false, true, array['food'], array['foodie','romantic','spontaneous'], null, '🍜'),
  ('Find a Dessert Place', 'Track down somewhere with a dessert you''ve been curious about.', 'under_30', 30, 'dessert', 'indoor', false, true, array['food'], array['foodie','simple'], null, '🍨'),
  ('Find a Local Museum', 'See what''s on nearby, even somewhere small or niche.', '1_2_hours', 90, 'museum', 'indoor', false, true, array['museums'], array['creative','simple'], null, '🏺'),

  -- ---------------------------------------------------------------------
  -- More date ideas — under 30 minutes
  -- ---------------------------------------------------------------------
  ('Draw Each Other', 'Grab paper and pencils and sketch each other, no art skills required.', 'under_30', 30, 'drawing', 'indoor', true, true, array['arts_crafts'], array['creative','cozy'], null, '✏️'),
  ('Write Letters to Your Future Selves', 'Write each other a letter to open together on an anniversary down the line.', 'under_30', 30, 'future_letters', 'indoor', true, true, array['staying_home'], array['romantic','cozy','creative'], null, '💌'),
  ('Start Learning a Language Together', 'Pick a language you''re both curious about and work through a first lesson.', 'under_30', 30, 'language_learning', 'indoor', true, true, array['staying_home'], array['cozy','creative'], null, '🗣️'),
  ('Make a Couple''s Bucket List', 'Write down everything you want to do together and pick your first one to plan.', 'under_30', 30, 'bucket_list', 'indoor', true, true, array['staying_home'], array['romantic','creative','cozy'], null, '📝'),
  ('Try a TikTok Trend Together', 'Pick a trending dance, challenge, or recipe and give it a go on camera.', 'under_30', 20, 'tiktok_trend', 'indoor', true, true, array['music','staying_home'], array['spontaneous','creative'], null, '📱'),
  ('Stargazing', 'Grab a blanket, find somewhere dark, and see how many constellations you can name.', 'under_30', 45, 'stargazing', 'outdoor', false, true, array['nature'], array['romantic','cozy'], null, '✨'),

  -- ---------------------------------------------------------------------
  -- More date ideas — 1–2 hours
  -- ---------------------------------------------------------------------
  ('Escape Room Challenge', 'Book a room and see if you can out-think the clock together.', '1_2_hours', 90, 'escape_room', 'indoor', false, true, array['gaming','exploring'], array['adventurous','spontaneous'], null, '🔐'),
  ('Sunset Picnic', 'Pack a blanket and snacks, then find a spot to watch the sky turn gold.', '1_2_hours', 90, 'picnic', 'outdoor', false, true, array['nature','food'], array['romantic','outdoors','cozy'], null, '🧺'),
  ('Take a Cooking Class', 'Sign up for a class and learn a new cuisine side by side.', '1_2_hours', 120, 'cooking_class', 'indoor', false, true, array['cooking','food'], array['foodie','creative'], null, '🧑‍🍳'),
  ('Board Game Night', 'Pick a couple of games and battle it out for bragging rights.', '1_2_hours', 90, 'board_games', 'indoor', true, true, array['gaming','staying_home'], array['cozy','simple','spontaneous'], null, '🎲'),
  ('Karaoke Night', 'Book a booth or clear the living room and belt out your favourite songs.', '1_2_hours', 90, 'karaoke', 'indoor', false, true, array['music'], array['spontaneous','creative'], null, '🎤'),
  ('Trivia Night', 'Team up for a pub quiz, or run your own trivia night at home.', '1_2_hours', 90, 'trivia', 'indoor', false, true, array['gaming'], array['spontaneous','simple'], null, '🧠'),
  ('Homemade Cuisine Night', 'Pick a cuisine you both love and cook a full spread of it from scratch.', '1_2_hours', 120, 'dinner', 'indoor', true, true, array['cooking','food'], array['foodie','cozy','creative'], null, '🍲'),
  ('Build a Blanket Fort', 'Pile up every cushion and blanket you own and camp out in the living room.', '1_2_hours', 90, 'blanket_fort', 'indoor', true, true, array['staying_home'], array['cozy','creative','simple'], null, '🏕️'),
  ('Trampoline Park Visit', 'Bounce around together until you''re both out of breath and laughing.', '1_2_hours', 90, 'trampoline_park', 'indoor', false, true, array['fitness'], array['adventurous','spontaneous'], null, '🤸'),
  ('Go Ice Skating', 'Wobble around the rink together and warm up with hot drinks after.', '1_2_hours', 90, 'ice_skating', 'indoor', false, true, array['fitness'], array['adventurous','spontaneous'], null, '⛸️'),
  ('Try Archery', 'Book a session and see who''s the better shot by the end of it.', '1_2_hours', 90, 'archery', 'either', false, true, array['fitness'], array['adventurous'], null, '🏹'),
  ('Go on a Bike Ride', 'Pick a scenic route and cycle it side by side, no destination required.', '1_2_hours', 90, 'bike_ride', 'outdoor', false, true, array['fitness','nature','exploring'], array['outdoors','adventurous','simple'], null, '🚴'),
  ('Indoor Rock Climbing', 'Hit the climbing gym and cheer each other up the wall.', '1_2_hours', 90, 'rock_climbing', 'indoor', false, true, array['fitness'], array['adventurous'], null, '🧗'),
  ('Try a New Sport Together', 'Pick a sport neither of you has played before and give it a proper go.', '1_2_hours', 90, 'new_sport', 'either', false, true, array['fitness'], array['adventurous','spontaneous'], null, '🏓'),
  ('Fitness Class With Puppies', 'Find a puppy yoga class or similar and get your workout in with company.', '1_2_hours', 60, 'puppy_fitness', 'indoor', false, true, array['fitness'], array['spontaneous','creative'], null, '🐶'),
  ('Start a Relationship Scrapbook', 'Gather tickets, photos, and notes and start pasting your story together.', '1_2_hours', 90, 'scrapbook', 'indoor', true, true, array['arts_crafts'], array['cozy','creative','romantic'], null, '📔'),
  ('Make a Coffee Table Photo Album', 'Pick your favourite photos together and put together a book to keep out.', '1_2_hours', 60, 'photo_album', 'indoor', true, true, array['photography','arts_crafts'], array['cozy','creative'], null, '📷'),
  ('Paint Ceramics', 'Pick a blank piece each at a paint-your-own studio and take your time with it.', '1_2_hours', 90, 'ceramics', 'indoor', false, true, array['arts_crafts'], array['creative','cozy'], null, '🏺'),
  ('Create a Signature Fragrance', 'Blend your own scent at a perfume workshop and take a bottle home each.', '1_2_hours', 90, 'fragrance_workshop', 'indoor', false, true, array['arts_crafts'], array['creative','romantic'], null, '🌸'),
  ('Make Candles', 'Melt, pour, and scent your own candles to take home and burn later.', '1_2_hours', 90, 'candle_making', 'indoor', false, true, array['arts_crafts'], array['creative','cozy'], null, '🕯️'),
  ('Tie Dye Clothes', 'Grab some plain white pieces and dye them into something one-of-a-kind.', '1_2_hours', 90, 'tie_dye', 'indoor', true, true, array['arts_crafts'], array['creative','spontaneous'], null, '🌈'),
  ('Reorganise and Declutter Together', 'Pick a room or closet and sort it out side by side, donate pile included.', '1_2_hours', 90, 'declutter', 'indoor', true, true, array['staying_home'], array['simple','cozy'], null, '🧹'),
  ('Plan Future Trips in Detail', 'Pick a destination, real or hypothetical, and plan it out like you''re really going.', '1_2_hours', 60, 'trip_planning', 'indoor', true, true, array['exploring','staying_home'], array['romantic','creative','simple'], null, '✈️'),
  ('Create a Shared Vision Board', 'Cut out images of the home, trips, and life you want and build it together.', '1_2_hours', 90, 'vision_board', 'indoor', true, true, array['arts_crafts','staying_home'], array['creative','romantic','cozy'], null, '🌟'),
  ('Beach Picnic', 'Pack a bag, find a spot in the sand, and spend the afternoon by the water.', '1_2_hours', 120, 'picnic', 'outdoor', false, true, array['nature','food'], array['romantic','outdoors','simple'], null, '🏖️'),
  ('Take a Night Drive', 'Put on a playlist and drive with no real destination in mind.', '1_2_hours', 60, 'night_drive', 'outdoor', false, true, array['music','exploring'], array['romantic','spontaneous'], null, '🌃'),
  ('Sushi Date Night', 'Find a sushi spot you haven''t tried and work through the menu together.', '1_2_hours', 90, 'restaurant', 'indoor', false, true, array['food'], array['foodie','romantic'], null, '🍣'),
  ('Pizza Date Night', 'Track down a proper pizza place, or make your own dough from scratch.', '1_2_hours', 90, 'restaurant', 'indoor', false, true, array['food'], array['foodie','simple'], null, '🍕'),

  -- ---------------------------------------------------------------------
  -- More date ideas — 3+ hours
  -- ---------------------------------------------------------------------
  ('A Day Without Phones', 'Put your phones away from morning to night and see where the day takes you.', '3_plus_hours', 300, 'phone_free_day', 'either', true, true, array['staying_home'], array['cozy','romantic','simple'], null, '📵'),
  ('Live Sports Game or Concert', 'Grab tickets to something happening live and cheer or sing along together.', '3_plus_hours', 240, 'live_event', 'either', false, true, array['music','exploring'], array['adventurous','spontaneous'], null, '🎟️'),
  ('Zoo or Aquarium Visit', 'Spend the day wandering exhibits and picking favourite animals.', '3_plus_hours', 210, 'zoo_aquarium', 'either', false, true, array['nature','exploring'], array['adventurous','simple'], null, '🦒'),
  ('Plan a Surprise Half-Day', 'Each of you plans a surprise half-day for the other — no hints allowed.', '3_plus_hours', 240, 'surprise_day', 'either', false, true, array['exploring'], array['romantic','spontaneous','creative'], null, '🎁'),
  ('Volunteer for a Cause You Both Care About', 'Spend a few hours giving back somewhere that means something to you both.', '3_plus_hours', 180, 'volunteering', 'either', false, true, array['exploring'], array['simple','romantic'], null, '🤝')
on conflict (title) where is_seed do update set
  description = excluded.description,
  duration_category = excluded.duration_category,
  estimated_minutes = excluded.estimated_minutes,
  activity_type = excluded.activity_type,
  indoor_outdoor = excluded.indoor_outdoor,
  is_at_home = excluded.is_at_home,
  interests = excluded.interests,
  date_styles = excluded.date_styles,
  image_url = excluded.image_url,
  emoji = excluded.emoji;
