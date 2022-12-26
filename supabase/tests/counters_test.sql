begin;
select plan( 4 );

select has_table( 'counters' );
select has_table( 'counter_events' );
select views_are('public',  ARRAY[ 'view_counters']);

select columns_are(
    'public',
    'view_counters',
    ARRAY[ 'id', 'name', 'created_at', 'updated_at', 'user_id', 'count', 'sort_index' ]
);

select * from finish();
rollback;
