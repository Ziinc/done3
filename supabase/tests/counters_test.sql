begin;
select plan( 3 );

select has_table( 'counters' );
select has_table( 'counter_events' );
select has_view( 'view_counters' );

select * from finish();
rollback;
